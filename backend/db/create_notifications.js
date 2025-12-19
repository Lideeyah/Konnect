const { pool } = require('../db');

const createNotificationsTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'trade', 'system'
                title TEXT NOT NULL,
                message TEXT,
                is_read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
        `);
        console.log("Notifications table created successfully (SQLite).");
    } catch (err) {
        console.error("Error creating notifications table:", err);
    }
};

createNotificationsTable();
