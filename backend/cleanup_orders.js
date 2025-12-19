const { pool } = require('./db');

async function cleanupOrders() {
    try {
        console.log("Cleaning up invalid orders...");

        // Find orders where buyer = seller
        const invalidOrders = await pool.query(`
            SELECT o.id, o.listing_id 
            FROM orders o
            JOIN listings l ON o.listing_id = l.id
            WHERE o.buyer_id = l.seller_id
        `);

        if (invalidOrders.rows.length === 0) {
            console.log("No invalid orders found.");
            return;
        }

        console.log(`Found ${invalidOrders.rows.length} invalid orders.`);

        for (const order of invalidOrders.rows) {
            console.log(`Deleting Order #${order.id} (Self-purchase)...`);

            // Delete Escrow
            await pool.query('DELETE FROM escrows WHERE order_id = ?', [order.id]);

            // Delete Order
            await pool.query('DELETE FROM orders WHERE id = ?', [order.id]);

            // Reset Listing to 'active'
            await pool.query('UPDATE listings SET status = ? WHERE id = ?', ['active', order.listing_id]);
        }

        console.log("Cleanup complete!");
    } catch (err) {
        console.error("Error cleaning up:", err);
    }
}

cleanupOrders();
