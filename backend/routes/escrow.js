const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const crypto = require('crypto');

// Create Escrow (Called when order is placed)
router.post('/create', async (req, res) => {
    const { order_id, amount, currency } = req.body;
    const deliveryCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const deliveryCodeHash = crypto.createHmac('sha256', 'secret_key').update(deliveryCode).digest('hex');

    try {
        await pool.query(
            'INSERT INTO escrows (order_id, amount, currency, status, delivery_code_hash, delivery_code) VALUES ($1, $2, $3, $4, $5, $6)',
            [order_id, amount, currency, 'locked', deliveryCodeHash, deliveryCode]
        );
        res.status(201).json({ message: 'Escrow created', deliveryCode });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Release Funds (Verify Code)
router.post('/release', async (req, res) => {
    const { order_id, code } = req.body;
    const codeHash = crypto.createHmac('sha256', 'secret_key').update(code).digest('hex');

    try {
        const result = await pool.query('SELECT * FROM escrows WHERE order_id = $1', [order_id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Escrow not found' });

        const escrow = result.rows[0];
        if (escrow.delivery_code_hash !== codeHash) {
            return res.status(400).json({ error: 'Invalid delivery code' });
        }

        await pool.query('UPDATE escrows SET status = $1 WHERE id = $2', ['released', escrow.id]);
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['completed', order_id]);

        res.json({ message: 'Funds released successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Dispute
router.post('/dispute', async (req, res) => {
    const { order_id } = req.body;
    try {
        await pool.query('UPDATE escrows SET status = $1 WHERE order_id = $2', ['disputed', order_id]);
        res.json({ message: 'Escrow disputed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
