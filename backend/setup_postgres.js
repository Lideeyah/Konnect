const { pool } = require('./db');

const createTables = async () => {
    try {
        // Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(50) UNIQUE,
                campus_id VARCHAR(50),
                role VARCHAR(20) DEFAULT 'buyer',
                password_hash VARCHAR(255) NOT NULL,
                gender VARCHAR(20),
                profile_picture TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Wallets Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS wallets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                currency VARCHAR(10) NOT NULL,
                balance DECIMAL(15, 2) DEFAULT 0.00,
                UNIQUE(user_id, currency)
            );
        `);

        // Marketplaces Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS marketplaces (
                id SERIAL PRIMARY KEY,
                owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Listings Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS listings (
                id SERIAL PRIMARY KEY,
                marketplace_id INTEGER REFERENCES marketplaces(id) ON DELETE CASCADE,
                seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(15, 2) NOT NULL,
                category VARCHAR(50),
                condition VARCHAR(50),
                images TEXT, -- JSON string or comma-separated URLs
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Orders Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
                amount DECIMAL(15, 2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending', -- pending, paid, shipped, delivered, completed, cancelled
                shipping_address TEXT,
                delivery_code VARCHAR(10),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Reviews Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
                reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                reviewee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Messages Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Notifications Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Email Verifications Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS email_verifications (
                email VARCHAR(255) PRIMARY KEY,
                code VARCHAR(10) NOT NULL,
                expires_at BIGINT NOT NULL -- Storing timestamp as BIGINT for simplicity
            );
        `);

        console.log('All tables created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating tables:', err);
        process.exit(1);
    }
};

createTables();
