const express = require('express');
const router = express.Router();
const { pool } = require('../db');

const verifyToken = require('../middleware/authMiddleware');

// Get Conversations for User
router.get('/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;

    // Authorization Check
    if (parseInt(userId) !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const result = await pool.query(
            `SELECT m.*, u.name as other_user_name, u.id as other_user_id, u.avatar_url as other_user_avatar 
             FROM messages m 
             JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id) 
             WHERE (m.sender_id = $1 OR m.receiver_id = $2) AND u.id != $3
             ORDER BY m.created_at DESC`,
            [userId, userId, userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send Message
router.post('/', verifyToken, async (req, res) => {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    try {
        const result = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
            [sender_id, receiver_id, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
