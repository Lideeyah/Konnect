const { pool } = require('./db');

async function migrate() {
    try {
        console.log('Creating email_verifications table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS email_verifications (
                email TEXT PRIMARY KEY,
                code TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            )
        `);
        console.log('Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
