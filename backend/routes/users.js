const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get User Profile
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id, name, email, phone, role, avatar_url, solana_wallet_address, created_at FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const verifyToken = require('../middleware/authMiddleware');

// Update User Profile
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    // Authorization Check
    if (parseInt(id) !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, phone, avatar_url, solana_wallet_address } = req.body;
    try {
        await pool.query(
            `UPDATE users SET 
                name = COALESCE($1, name), 
                phone = COALESCE($2, phone), 
                avatar_url = COALESCE($3, avatar_url), 
                solana_wallet_address = COALESCE($4, solana_wallet_address) 
            WHERE id = $5`,
            [name, phone, avatar_url, solana_wallet_address, id]
        );

        const result = await pool.query('SELECT id, name, email, phone, role, avatar_url, solana_wallet_address FROM users WHERE id = $1', [id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
