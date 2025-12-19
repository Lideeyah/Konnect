const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get reviews for a user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            'SELECT r.*, u.name as reviewer_name FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE reviewee_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        const stats = await pool.query(
            'SELECT AVG(rating) as average, COUNT(*) as count FROM reviews WHERE reviewee_id = $1',
            [userId]
        );

        res.json({
            reviews: result.rows,
            average: parseFloat(stats.rows[0].average || 0).toFixed(1),
            count: parseInt(stats.rows[0].count || 0)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const verifyToken = require('../middleware/authMiddleware');

// ...

// Submit a review
router.post('/', verifyToken, async (req, res) => {
    const { order_id, reviewee_id, rating, comment } = req.body;
    const reviewer_id = req.user.id;

    try {
        // Check if already reviewed
        const existing = await pool.query('SELECT id FROM reviews WHERE order_id = $1', [order_id]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Order already reviewed' });
        }

        await pool.query(
            'INSERT INTO reviews (order_id, reviewer_id, reviewee_id, rating, comment) VALUES ($1, $2, $3, $4, $5)',
            [order_id, reviewer_id, reviewee_id, rating, comment]
        );

        res.status(201).json({ message: 'Review submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
