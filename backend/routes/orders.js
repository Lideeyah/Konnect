const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const crypto = require('crypto');
const verifyToken = require('../middleware/authMiddleware');

// Checkout (Create Order & Escrow)
router.post('/checkout', verifyToken, async (req, res) => {
    const { listingId, quantity } = req.body;
    const buyerId = req.user.id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get Listing & Seller
        const listingRes = await client.query('SELECT * FROM listings WHERE id = $1', [listingId]);
        if (listingRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Listing not found' });
        }
        const listing = listingRes.rows[0];

        if (listing.status !== 'active') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Listing is not active' });
        }
        if (listing.quantity < quantity) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Not enough stock' });
        }

        // 2. Calculate Amounts
        const totalAmount = listing.price * quantity;
        const currency = listing.currency;
        const platform_fee = totalAmount * 0.02; // 2% Fee
        const escrowAmount = totalAmount - platform_fee;

        // 3. Check Buyer Balance
        const walletRes = await client.query('SELECT * FROM wallets WHERE user_id = $1 AND currency = $2', [buyerId, currency]);
        if (walletRes.rows.length === 0 || walletRes.rows[0].balance < totalAmount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // 4. Deduct from Buyer
        await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND currency = $3', [totalAmount, buyerId, currency]);

        // 5. Create Order
        const deliveryCode = Math.floor(100000 + Math.random() * 900000).toString();
        const deliveryCodeHash = crypto.createHmac('sha256', process.env.DELIVERY_CODE_SECRET || 'fallback_secret').update(deliveryCode).digest('hex');

        const orderRes = await client.query(
            'INSERT INTO orders (buyer_id, listing_id, amount, currency, status, platform_fee) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [buyerId, listingId, totalAmount, currency, 'pending', platform_fee]
        );
        const orderId = orderRes.rows[0].id;

        // Create Escrow
        await client.query(
            'INSERT INTO escrows (order_id, amount, currency, status, delivery_code_hash, delivery_code) VALUES ($1, $2, $3, $4, $5, $6)',
            [orderId, escrowAmount, currency, 'locked', deliveryCodeHash, deliveryCode]
        );

        // 6. Update Listing Quantity
        const newQuantity = listing.quantity - quantity;
        const newStatus = newQuantity === 0 ? 'sold_out' : 'active';
        await client.query('UPDATE listings SET quantity = $1, status = $2 WHERE id = $3', [newQuantity, newStatus, listingId]);

        // Notify Seller
        await client.query(
            'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)',
            [listing.seller_id, 'trade', 'New Order Received', `You have a new order for "${listing.title}". Please check your dashboard.`]
        );

        // Notify Buyer
        await client.query(
            'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)',
            [buyerId, 'trade', 'Order Placed', `Your order for "${listing.title}" has been placed successfully.`]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Order placed successfully', orderId, deliveryCode });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    } finally {
        client.release();
    }
});

// Verify Delivery & Release Funds
router.post('/verify-delivery', async (req, res) => {
    const { orderId, code } = req.body;

    try {
        // 1. Get Escrow (Read-only, no transaction needed yet)
        const escrowRes = await pool.query('SELECT * FROM escrows WHERE order_id = $1', [orderId]);
        if (escrowRes.rows.length === 0) {
            return res.status(404).json({ error: 'Escrow not found' });
        }
        const escrow = escrowRes.rows[0];

        // 2. Verify Code
        const inputHash = crypto.createHmac('sha256', process.env.DELIVERY_CODE_SECRET || 'fallback_secret').update(code).digest('hex');
        if (inputHash !== escrow.delivery_code_hash) {
            return res.status(400).json({ error: 'Invalid delivery code' });
        }

        if (escrow.status === 'released') {
            return res.status(400).json({ error: 'Funds already released' });
        }

        // 3. Release Funds
        // Get Seller ID
        const orderRes = await pool.query(`
            SELECT l.seller_id, u.wallet_address as seller_wallet, o.buyer_id, l.title
            FROM orders o 
            JOIN listings l ON o.listing_id = l.id 
            JOIN users u ON l.seller_id = u.id
            WHERE o.id = $1
        `, [orderId]);
        const seller = orderRes.rows[0];

        if (escrow.currency === 'USDT' || escrow.currency === 'SOL') {
            // On-Chain Release (Cannot be rolled back, do first)
            const { escrowKeypair, connection, platformFeeWallet } = require('../escrowWallet');
            const { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
            const { Transaction, PublicKey, SystemProgram } = require('@solana/web3.js');

            try {
                const orderFeeRes = await pool.query('SELECT platform_fee, amount FROM orders WHERE id = $1', [orderId]);
                const platformFee = orderFeeRes.rows[0].platform_fee;
                const sellerShare = escrow.amount;

                const sellerPubkey = new PublicKey(seller.seller_wallet);

                // Fetch Admin Wallet for Fees
                let feeWalletPubkey = platformFeeWallet;
                const adminWalletRes = await pool.query('SELECT solana_wallet_address FROM users WHERE email = $1', ['admin@konnect.com']);
                if (adminWalletRes.rows.length > 0 && adminWalletRes.rows[0].solana_wallet_address) {
                    try {
                        feeWalletPubkey = new PublicKey(adminWalletRes.rows[0].solana_wallet_address);
                    } catch (e) {
                        console.error("Invalid Admin Wallet Address, using default:", e);
                    }
                }

                const transaction = new Transaction();

                if (escrow.currency === 'USDT') {
                    const USDT_MINT = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
                    const escrowATA = await getAssociatedTokenAddress(USDT_MINT, escrowKeypair.publicKey);
                    const sellerATA = await getAssociatedTokenAddress(USDT_MINT, sellerPubkey);
                    const platformATA = await getAssociatedTokenAddress(USDT_MINT, feeWalletPubkey);

                    transaction.add(
                        createTransferInstruction(escrowATA, sellerATA, escrowKeypair.publicKey, BigInt(Math.round(sellerShare * 1000000)), [], TOKEN_PROGRAM_ID)
                    );
                    transaction.add(
                        createTransferInstruction(escrowATA, platformATA, escrowKeypair.publicKey, BigInt(Math.round(platformFee * 1000000)), [], TOKEN_PROGRAM_ID)
                    );
                } else if (escrow.currency === 'SOL') {
                    transaction.add(
                        SystemProgram.transfer({ fromPubkey: escrowKeypair.publicKey, toPubkey: sellerPubkey, lamports: BigInt(Math.round(sellerShare * 1000000000)) })
                    );
                    transaction.add(
                        SystemProgram.transfer({ fromPubkey: escrowKeypair.publicKey, toPubkey: feeWalletPubkey, lamports: BigInt(Math.round(platformFee * 1000000000)) })
                    );
                }

                const signature = await connection.sendTransaction(transaction, [escrowKeypair]);
                await connection.confirmTransaction(signature, "confirmed");
                console.log(`Funds Released On-Chain (${escrow.currency}):`, signature);

            } catch (txErr) {
                console.error("On-Chain Release Failed:", txErr);
                return res.status(500).json({ error: 'On-Chain Release Failed: ' + txErr.message });
            }
        }

        // DB Updates (Atomic)
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            if (escrow.currency === 'NGN') {
                // Off-Chain NGN Release
                const orderFeeRes = await client.query('SELECT platform_fee, amount FROM orders WHERE id = $1', [orderId]);
                const platformFee = orderFeeRes.rows[0].platform_fee;
                const sellerShare = escrow.amount;

                // 1. Credit Seller
                await client.query('UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND currency = $3', [sellerShare, seller.seller_id, escrow.currency]);

                // 2. Credit Platform Admin
                const adminRes = await client.query('SELECT id FROM users WHERE email = $1', ['admin@konnect.com']);
                if (adminRes.rows.length > 0) {
                    const adminId = adminRes.rows[0].id;
                    await client.query('UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND currency = $3', [platformFee, adminId, escrow.currency]);
                }
            }

            // 4. Update Statuses
            await client.query('UPDATE escrows SET status = $1 WHERE id = $2', ['released', escrow.id]);
            await client.query('UPDATE orders SET status = $1 WHERE id = $2', ['completed', orderId]);

            // Notify Buyer
            await client.query(
                'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)',
                [orderRes.rows[0].buyer_id, 'trade', 'Order Completed', `Your order for "${orderRes.rows[0].title}" has been completed.`]
            );

            // Notify Seller
            await client.query(
                'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)',
                [orderRes.rows[0].seller_id, 'trade', 'Order Completed', `Order for "${orderRes.rows[0].title}" has been completed and funds released.`]
            );

            await client.query('COMMIT');
            res.json({ message: 'Delivery verified, funds released' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Orders for User
router.get('/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    const { role } = req.query; // 'buyer' or 'seller'

    // Authorization Check
    if (parseInt(userId) !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        let queryText;
        if (role === 'seller') {
            queryText = `
                SELECT o.*, l.title, l.image_url, e.status as escrow_status, e.delivery_code 
                FROM orders o
                JOIN listings l ON o.listing_id = l.id
                LEFT JOIN escrows e ON o.id = e.order_id
                WHERE l.seller_id = $1
            `;
        } else {
            queryText = `
                SELECT o.*, l.title, l.image_url, e.status as escrow_status, e.delivery_code
                FROM orders o
                JOIN listings l ON o.listing_id = l.id
                LEFT JOIN escrows e ON o.id = e.order_id
                WHERE o.buyer_id = $1
            `;
        }
        const result = await pool.query(queryText, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
