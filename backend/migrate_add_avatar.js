const { db } = require('./db');

db.serialize(() => {
    db.run("ALTER TABLE users ADD COLUMN avatar_url TEXT", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column "avatar_url" already exists.');
            } else {
                console.error('Error adding column:', err);
            }
        } else {
            console.log('Column "avatar_url" added successfully.');
        }
    });
});
