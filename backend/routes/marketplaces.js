const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all marketplaces
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM marketplaces');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Initialize Marketplace
router.post('/', async (req, res) => {
    const { name, campus_id, country, currency } = req.body;
    try {
        await pool.query(
            'INSERT INTO marketplaces (name, campus_id, country, currency) VALUES ($1, $2, $3, $4)',
            [name, campus_id, country || 'Nigeria', currency || 'NGN']
        );
        res.status(201).json({ message: 'Marketplace initialized' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

module.exports = router;
