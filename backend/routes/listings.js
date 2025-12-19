const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get listings (with optional filters)
router.get('/', async (req, res) => {
    const { category, search, campus_id } = req.query;

    // Base query: Join users to get seller's campus
    let queryText = `
        SELECT listings.*, users.name as seller_name, users.avatar_url, users.campus_id 
        FROM listings 
        JOIN users ON listings.seller_id = users.id 
        WHERE listings.status = $1
    `;
    let params = ['active'];
    let paramIndex = 2;

    if (campus_id) {
        queryText += ` AND users.campus_id = $${paramIndex}`;
        params.push(campus_id);
        paramIndex++;
    }

    if (category && category !== 'All') {
        queryText += ` AND listings.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
    }

    if (search) {
        queryText += ` AND (listings.title ILIKE $${paramIndex} OR listings.description ILIKE $${paramIndex + 1})`;
        params.push(`%${search}%`, `%${search}%`);
        paramIndex += 2;
    }

    queryText += ' ORDER BY listings.created_at DESC';

    try {
        const result = await pool.query(queryText, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Single Listing
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT listings.*, users.name as seller_name, users.campus_id as seller_campus 
             FROM listings 
             JOIN users ON listings.seller_id = users.id 
             WHERE listings.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const verifyToken = require('../middleware/authMiddleware');

// Create Listing
router.post('/', verifyToken, async (req, res) => {
    const { title, description, price, currency, image_url, category, type, quantity } = req.body;
    const seller_id = req.user.id; // From Token

    try {
        await pool.query(
            'INSERT INTO listings (seller_id, title, description, price, currency, image_url, category, type, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [seller_id, title, description, price, currency, image_url, category, type || 'goods', quantity || 1]
        );
        res.status(201).json({ message: 'Listing created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
