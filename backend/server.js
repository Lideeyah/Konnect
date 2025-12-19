const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());

// Serve Uploaded Files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Config Routes
app.get('/api/config/escrow', (req, res) => {
    const { escrowKeypair } = require('./escrowWallet');
    res.json({ publicKey: escrowKeypair.publicKey.toString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/marketplaces', require('./routes/marketplaces'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/escrow', require('./routes/escrow'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
