const { db } = require('./db');

const schema = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    campus_id TEXT,
    role TEXT DEFAULT 'buyer',
    avatar_url TEXT,
    bank_name TEXT,
    account_number TEXT,
    account_name TEXT,
    solana_wallet_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    currency TEXT NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS marketplaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    campus_id TEXT UNIQUE NOT NULL,
    country TEXT DEFAULT 'Nigeria',
    currency TEXT DEFAULT 'NGN'
);

CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    image_url TEXT,
    category TEXT,
    type TEXT DEFAULT 'goods',
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(seller_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_id INTEGER,
    listing_id INTEGER,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(buyer_id) REFERENCES users(id),
    FOREIGN KEY(listing_id) REFERENCES listings(id)
);

CREATE TABLE IF NOT EXISTS escrows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    status TEXT DEFAULT 'locked',
    delivery_code_hash TEXT,
    delivery_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    reference TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
`;

db.serialize(() => {
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error creating tables:', err);
        } else {
            console.log('Tables created successfully.');
        }
    });
});
