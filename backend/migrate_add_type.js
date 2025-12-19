const { db } = require('./db');

db.serialize(() => {
    db.run("ALTER TABLE listings ADD COLUMN type TEXT DEFAULT 'goods'", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column "type" already exists.');
            } else {
                console.error('Error adding column:', err);
            }
        } else {
            console.log('Column "type" added successfully.');
        }
    });
});
