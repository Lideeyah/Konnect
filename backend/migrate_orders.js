const { pool } = require('./db');

async function migrate() {
    try {
        // Attempt to add columns. SQLite doesn't support IF NOT EXISTS for columns in ALTER TABLE
        // so we just try and catch the error if they exist.
        try {
            await pool.query('ALTER TABLE orders ADD COLUMN shipping_address TEXT');
            console.log('Added shipping_address column');
        } catch (e) { console.log('shipping_address column likely exists'); }

        try {
            await pool.query('ALTER TABLE orders ADD COLUMN platform_fee DECIMAL(10,2) DEFAULT 0');
            console.log('Added platform_fee column');
        } catch (e) { console.log('platform_fee column likely exists'); }

        console.log('Migration complete');
    } catch (err) {
        console.error('Migration error:', err);
    }
}

migrate();
