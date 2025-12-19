const express = require('express');
const router = express.Router();
const { pool } = require('../db');

const { handleSqlError } = require('../utils/errorHandler');

// Check Availability
router.post('/check-availability', async (req, res) => {
    const { email, phone } = req.body;
    try {
        if (email) {
            const emailRes = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
            if (emailRes.rows.length > 0) return res.status(400).json({ error: 'Email is already taken' });
        }
        if (phone) {
            const phoneRes = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
            if (phoneRes.rows.length > 0) return res.status(400).json({ error: 'Phone number is already taken' });
        }
        res.json({ available: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');

// Email Transporter Configuration
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP configuration missing. Email verification will fail.");
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send Verification Code
router.post('/send-code', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    try {
        // Store code in DB
        await pool.query(
            'INSERT INTO email_verifications (email, code, expires_at) VALUES ($1, $2, $3) ON CONFLICT(email) DO UPDATE SET code = $4, expires_at = $5',
            [email.toLowerCase(), code, expiresAt, code, expiresAt]
        );

        // Send Email
        const mailOptions = {
            from: '"Konnect Support" <noreply@konnect.com>',
            to: email,
            subject: 'Your Konnect Verification Code',
            text: `Your verification code is: ${code}. It expires in 10 minutes.`,
            html: `<b>Your verification code is: ${code}</b><br>It expires in 10 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);

        res.json({ message: 'Verification code sent' });
    } catch (err) {
        console.error("Email sending failed:", err);
        res.status(500).json({ error: 'Failed to send verification code. Please check SMTP configuration.' });
    }
});

// Signup
router.post('/signup', async (req, res) => {
    const { name, email, phone, campus_id, role, password, gender, verification_code } = req.body;

    try {
        // Verify Code
        const verificationRes = await pool.query(
            'SELECT code, expires_at FROM email_verifications WHERE email = $1',
            [email.toLowerCase()]
        );

        if (verificationRes.rows.length === 0) {
            return res.status(400).json({ error: 'Please verify your email first' });
        }

        const { code, expires_at } = verificationRes.rows[0];

        if (code !== verification_code) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        if (Date.now() > expires_at) {
            return res.status(400).json({ error: 'Verification code expired' });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await pool.query(
            'INSERT INTO users (name, email, phone, campus_id, role, password_hash, gender) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [name, email.toLowerCase(), phone, campus_id, role || 'buyer', passwordHash, gender || 'other']
        );

        // Delete verification record
        await pool.query('DELETE FROM email_verifications WHERE email = $1', [email.toLowerCase()]);

        const userRes = await pool.query('SELECT id, name, email, role, campus_id FROM users WHERE email = $1', [email.toLowerCase()]);
        const user = userRes.rows[0];

        await pool.query('INSERT INTO wallets (user_id, currency) VALUES ($1, $2)', [user.id, 'NGN']);
        await pool.query('INSERT INTO wallets (user_id, currency) VALUES ($1, $2)', [user.id, 'USDT']);

        // Generate Token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ message: 'User created successfully', user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];

        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Remove password from response
        delete user.password_hash;

        res.json({ message: 'Login successful', user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
