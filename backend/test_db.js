const { pool } = require('./db');

async function testDB() {
    try {
        console.log('Connecting to DB...');
        const client = await pool.connect();
        console.log('Connected!');
        const res = await client.query('SELECT NOW()');
        console.log('Time:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('DB Connection Failed:', err);
    } finally {
        await pool.end();
    }
}

testDB();
