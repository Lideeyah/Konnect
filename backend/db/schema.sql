-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  campus_id INT,
  role VARCHAR(20) DEFAULT 'buyer', -- 'buyer', 'seller'
  password_hash VARCHAR(255), -- For MVP
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets
CREATE TABLE wallets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  currency VARCHAR(10) NOT NULL, -- 'NGN', 'USDT'
  balance DECIMAL(18, 2) DEFAULT 0.00,
  UNIQUE(user_id, currency)
);

-- Marketplaces (Campuses)
CREATE TABLE marketplaces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  pda_address VARCHAR(255), -- Solana PDA
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listings
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  seller_id INT REFERENCES users(id),
  marketplace_id INT REFERENCES marketplaces(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(18, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'NGN',
  delivery_fee DECIMAL(18, 2) DEFAULT 0.00,
  image_url VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- active, sold, deleted
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  buyer_id INT REFERENCES users(id),
  listing_id INT REFERENCES listings(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, escrow_locked, delivered, completed, cancelled
  total_amount DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escrow
CREATE TABLE escrows (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  amount DECIMAL(18, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'locked', -- locked, released, refunded
  delivery_code_hash VARCHAR(255), -- HMAC hash
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  wallet_id INT REFERENCES wallets(id),
  type VARCHAR(50) NOT NULL, -- deposit, withdrawal, purchase, sale
  amount DECIMAL(18, 2) NOT NULL,
  reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
