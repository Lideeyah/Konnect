const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'konnect.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Running migration: Adding 'gender' column to 'users' table...");

    db.run("ALTER TABLE users ADD COLUMN gender TEXT DEFAULT 'other'", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("Column 'gender' already exists. Skipping.");
            } else {
                console.error("Error adding column:", err.message);
            }
        } else {
            console.log("Successfully added 'gender' column.");
        }
    });
});

db.close();
