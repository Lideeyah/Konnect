const { pool } = require('./db');

async function seed() {
    try {
        // 1. Ensure a seller exists
        await pool.query(
            'INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES (999, "Demo Seller", "seller@demo.com", "hash", "seller")'
        );

        // 2. Ensure listing ID 1 exists
        await pool.query(
            'INSERT OR IGNORE INTO listings (id, seller_id, title, description, price, currency, status, category) VALUES (1, 999, "Used MacBook Pro M1", "Great condition", 450000, "NGN", "active", "electronics")'
        );

        console.log('Seeding complete: Seller 999 and Listing 1 created.');
    } catch (err) {
        console.error('Seeding failed:', err);
    }
}

seed();
