const { db } = require('./db');

db.serialize(() => {
    db.run("ALTER TABLE users ADD COLUMN wallet_address TEXT", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column wallet_address already exists.');
            } else {
                console.error('Error adding column:', err);
            }
        } else {
            console.log('Column wallet_address added successfully.');
        }
    });
});
