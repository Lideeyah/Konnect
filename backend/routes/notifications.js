const express = require('express');
const router = express.Router();
const { pool } = require('../db');

const verifyToken = require('../middleware/authMiddleware');

// Get Notifications
router.get('/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;

    if (parseInt(userId) !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark as Read
router.put('/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE notifications SET read = TRUE WHERE id = $1', [id]);
        res.json({ message: 'Marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark All as Read
router.put('/read-all/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await pool.query('UPDATE notifications SET read = TRUE WHERE user_id = $1', [userId]);
        res.json({ message: 'All marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
