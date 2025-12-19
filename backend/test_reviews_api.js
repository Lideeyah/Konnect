const { pool } = require('./db');
const reviewsRouter = require('./routes/reviews');
const express = require('express');
const request = require('supertest');

const app = express();
app.use(express.json());
app.use('/api/reviews', reviewsRouter);

async function testReviews() {
    try {
        // 1. Create a dummy user if not exists (we need an ID)
        // For simplicity, we'll assume user ID 1 exists or just try to get reviews for ID 1.
        // If no user, we might get empty list, which is fine for this test.

        console.log('Testing GET /api/reviews/1...');
        const res = await request(app).get('/api/reviews/1');

        if (res.status === 200) {
            console.log('Success! Response:', res.body);
        } else {
            console.error('Failed! Status:', res.status, 'Body:', res.body);
        }

    } catch (err) {
        console.error('Test failed with error:', err);
    }
}

testReviews();
