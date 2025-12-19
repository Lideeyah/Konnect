const { pool } = require('./db');
const fs = require('fs');

async function debugOrders() {
    try {
        const res = await pool.query(`
            SELECT o.id, o.buyer_id, o.listing_id, l.seller_id, l.title 
            FROM orders o
            JOIN listings l ON o.listing_id = l.id
        `);
        fs.writeFileSync('debug_output.txt', JSON.stringify(res.rows, null, 2));
        console.log("Done writing to file.");
    } catch (err) {
        console.error(err);
    }
}

debugOrders();
