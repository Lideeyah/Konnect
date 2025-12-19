const { pool } = require('./db');
const path = require('path');

async function checkUser() {
    try {
        // Get the first user (assuming ID 1 or just list all)
        const res = await pool.query('SELECT id, name, avatar FROM users');
        console.log('Users:', res.rows);

        const uploadDir = path.join(__dirname, '../public/uploads'); // relative to this script in backend/
        console.log('Resolved Upload Dir:', uploadDir);

    } catch (err) {
        console.error(err);
    }
}

checkUser();
