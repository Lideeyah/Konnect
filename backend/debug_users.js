const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'konnect.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Checking 'users' table schema...");
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) {
            console.error("Error getting schema:", err);
        } else {
            console.log("Schema:", rows);
        }
    });

    console.log("\nChecking recent users...");
    db.all("SELECT id, name, email, role, gender FROM users ORDER BY id DESC LIMIT 5", (err, rows) => {
        if (err) {
            console.error("Error getting users:", err);
        } else {
            console.log("Recent Users:", rows);
        }
    });
});

db.close();
