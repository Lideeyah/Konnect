const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

async function migrate() {
    try {
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'buyer';");
        console.log("Migration successful: Added 'role' column to 'users' table.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

migrate();
