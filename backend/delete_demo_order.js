const { pool } = require('./db');

async function deleteDemoOrder() {
    try {
        console.log("Deleting Demo Order #1...");

        // Delete Escrow for Order 1
        await pool.query('DELETE FROM escrows WHERE order_id = 1');

        // Delete Order 1
        await pool.query('DELETE FROM orders WHERE id = 1');

        // Reset Listing 1 to 'active'
        await pool.query('UPDATE listings SET status = ? WHERE id = 1', ['active']);

        console.log("Demo Order #1 deleted.");
    } catch (err) {
        console.error("Error deleting demo order:", err);
    }
}

deleteDemoOrder();
