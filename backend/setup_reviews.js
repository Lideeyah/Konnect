const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'konnect.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            reviewer_id INTEGER,
            reviewee_id INTEGER,
            rating INTEGER CHECK(rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(order_id) REFERENCES orders(id),
            FOREIGN KEY(reviewer_id) REFERENCES users(id),
            FOREIGN KEY(reviewee_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error("Error creating reviews table:", err.message);
        } else {
            console.log("Reviews table created successfully.");
        }
    });
});

db.close();
