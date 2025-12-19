const { db } = require('./db');

db.serialize(() => {
    db.run("ALTER TABLE listings ADD COLUMN quantity INTEGER DEFAULT 1", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column "quantity" already exists.');
            } else {
                console.error('Error adding column:', err);
            }
        } else {
            console.log('Column "quantity" added successfully.');
        }
    });
});
