const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'konnect.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("ALTER TABLE users ADD COLUMN avatar TEXT", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column "avatar" already exists.');
            } else {
                console.error('Error adding column:', err.message);
            }
        } else {
            console.log('Column "avatar" added successfully.');
        }
    });
});

db.close();
