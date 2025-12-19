const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'konnect.db');
const db = new sqlite3.Database(dbPath);

const clearData = () => {
    db.serialize(() => {
        // Disable foreign key constraints to allow deletion in any order (optional, but safer to just delete in order)
        db.run("PRAGMA foreign_keys = OFF;");

        const tables = [
            'messages',
            'reviews',
            'escrows',
            'orders',
            'listings',
            'wallets',
            'users',
            'marketplaces'
        ];

        tables.forEach(table => {
            db.run(`DELETE FROM ${table}`, (err) => {
                if (err) {
                    console.error(`Error clearing ${table}:`, err.message);
                } else {
                    console.log(`Cleared ${table}`);
                }
            });
        });

        // Re-enable foreign keys
        db.run("PRAGMA foreign_keys = ON;", () => {
            console.log("Database cleared successfully.");
            db.close();
        });
    });
};

clearData();
