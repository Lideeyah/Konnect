const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'konnect',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE escrows 
            ADD COLUMN IF NOT EXISTS delivery_code VARCHAR(10);
        `);
        console.log('Added delivery_code column to escrows table');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
