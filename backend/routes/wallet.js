const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const https = require('https');
const verifyToken = require('../middleware/authMiddleware');

// Helper to make Paystack requests
const paystackRequest = (path, method, body = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path,
            method,
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', error => {
            reject(error);
        });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

// Get Wallet Balance & Transactions
router.get('/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;

    if (parseInt(userId) !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        // Get Balances
        const balanceRes = await pool.query(
            'SELECT currency, balance FROM wallets WHERE user_id = $1',
            [userId]
        );

        // Get Transactions
        const txRes = await pool.query(
            `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
            [userId]
        );

        // Format balances
        const balanceMap = { NGN: 0, USDT: 0 };
        balanceRes.rows.forEach(row => {
            balanceMap[row.currency] = parseFloat(row.balance);
        });

        res.json({
            balances: balanceMap,
            transactions: txRes.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Initialize Deposit (Paystack)
router.post('/deposit', verifyToken, async (req, res) => {
    const { amount, currency = 'NGN', callbackUrl } = req.body;
    const userId = req.user.id;

    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    try {
        // Get User Email
        const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const email = userRes.rows[0].email;

        // Init Paystack Transaction
        const paystackRes = await paystackRequest('/transaction/initialize', 'POST', {
            email,
            amount: Math.round(amount * 100), // Convert to kobo (integer)
            currency,
            callback_url: callbackUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/wallet`,
            metadata: { userId, type: 'deposit' }
        });

        if (!paystackRes.status) {
            return res.status(400).json({ error: paystackRes.message });
        }

        // Log pending transaction
        await pool.query(
            'INSERT INTO transactions (user_id, type, amount, currency, reference, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, 'deposit', amount, currency, paystackRes.data.reference, 'pending']
        );

        res.json({
            authorization_url: paystackRes.data.authorization_url,
            reference: paystackRes.data.reference
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify Deposit
router.get('/verify/:reference', async (req, res) => {
    const { reference } = req.params;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if already processed
        const txCheck = await client.query('SELECT id, status, user_id FROM transactions WHERE reference = $1', [reference]);
        if (txCheck.rows.length > 0 && txCheck.rows[0].status === 'success') {
            await client.query('ROLLBACK');
            return res.json({ message: 'Transaction already processed' });
        }

        // Verify with Paystack
        const verifyRes = await paystackRequest(`/transaction/verify/${reference}`, 'GET');

        if (!verifyRes.status || verifyRes.data.status !== 'success') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Transaction failed or invalid' });
        }

        const { amount, metadata } = verifyRes.data;
        const userId = txCheck.rows.length > 0 ? txCheck.rows[0].user_id : metadata.userId;
        const actualAmount = amount / 100;

        // Update Balance
        await client.query(
            'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND currency = $3',
            [actualAmount, userId, 'NGN']
        );

        // Update Transaction
        await client.query(
            'UPDATE transactions SET status = $1, amount = $2 WHERE reference = $3',
            ['success', actualAmount, reference]
        );

        // Notify User
        await client.query(
            'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)',
            [userId, 'deposit', 'Deposit Successful', `Your deposit of NGN ${actualAmount} was successful.`]
        );

        await client.query('COMMIT');
        res.json({ message: 'Deposit verified and wallet funded', amount: actualAmount });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// Request Withdrawal
router.post('/withdraw', verifyToken, async (req, res) => {
    const { amount, currency = 'NGN', bankDetails } = req.body;
    const userId = req.user.id;

    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Check Balance
        const walletRes = await client.query('SELECT balance FROM wallets WHERE user_id = $1 AND currency = $2', [userId, currency]);
        if (walletRes.rows.length === 0 || walletRes.rows[0].balance < amount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // 2. Deduct Balance (Lock funds)
        await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND currency = $3', [amount, userId, currency]);

        // 3. Create Transaction Record
        await client.query(
            'INSERT INTO transactions (user_id, type, amount, currency, status, reference) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, 'withdrawal', amount, currency, 'pending', JSON.stringify(bankDetails)]
        );

        // Notify User
        await client.query(
            'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)',
            [userId, 'withdrawal', 'Withdrawal Requested', `Your withdrawal request for ${currency} ${amount} has been submitted.`]
        );

        await client.query('COMMIT');
        res.json({ message: 'Withdrawal request submitted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

module.exports = router;
