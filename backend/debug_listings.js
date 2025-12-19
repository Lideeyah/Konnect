const { pool } = require('./db');

async function checkListings() {
    try {
        const res = await pool.query('SELECT id, title, image_url FROM listings');
        console.log('Listings:', res.rows);
    } catch (err) {
        console.error(err);
    }
}

checkListings();
