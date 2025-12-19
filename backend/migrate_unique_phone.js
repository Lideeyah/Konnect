const { db } = require('./db');

db.serialize(() => {
    // 1. Create Unique Index on Phone
    // This enforces uniqueness without needing to recreate the table
    db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone)`, (err) => {
        if (err) {
            console.error("Error creating unique index on phone:", err.message);
        } else {
            console.log("Success: Unique index 'idx_users_phone' created.");
        }
    });
});
