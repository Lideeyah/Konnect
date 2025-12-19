const { db } = require('./db');
const crypto = require('crypto');

const adminEmail = 'admin@konnect.com';
const adminPassword = 'AdminPassword123!'; // Change this!
const adminHash = crypto.createHash('sha256').update(adminPassword).digest('hex');

db.serialize(() => {
    db.get("SELECT id FROM users WHERE email = ?", [adminEmail], (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        if (row) {
            console.log("Admin user already exists. ID:", row.id);
        } else {
            db.run(
                "INSERT INTO users (name, email, password_hash, role, campus_id) VALUES (?, ?, ?, ?, ?)",
                ['Konnect Admin', adminEmail, adminHash, 'admin', 'global'],
                function (err) {
                    if (err) console.error("Error creating admin:", err);
                    else {
                        const adminId = this.lastID;
                        console.log("Admin user created. ID:", adminId);
                        // Create Wallets
                        db.run("INSERT INTO wallets (user_id, currency) VALUES (?, ?)", [adminId, 'NGN']);
                        db.run("INSERT INTO wallets (user_id, currency) VALUES (?, ?)", [adminId, 'USDT']);
                    }
                }
            );
        }
    });
});
