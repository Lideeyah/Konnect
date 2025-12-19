const { db } = require('./db');

db.serialize(() => {
    // 1. Add Country and Currency to Marketplaces
    db.run("ALTER TABLE marketplaces ADD COLUMN country TEXT DEFAULT 'Nigeria'", (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error("Error adding country:", err);
        else console.log("Added country column");
    });

    db.run("ALTER TABLE marketplaces ADD COLUMN currency TEXT DEFAULT 'NGN'", (err) => {
        if (err && !err.message.includes('duplicate column name')) console.error("Error adding currency:", err);
        else console.log("Added currency column");
    });

    // 2. Make Phone Unique (using Index)
    db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone)", (err) => {
        if (err) console.error("Error creating phone index:", err);
        else console.log("Created unique index on users(phone)");
    });
});
