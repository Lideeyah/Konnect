const { db } = require('./db');

db.serialize(() => {
    // Find duplicates
    db.all(`SELECT phone, COUNT(*) as count FROM users GROUP BY phone HAVING count > 1`, (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        if (rows.length === 0) {
            console.log("No duplicates found.");
            return;
        }

        console.log(`Found ${rows.length} duplicate phone numbers. Fixing...`);

        rows.forEach(row => {
            // For each duplicate phone, get all users
            db.all(`SELECT id FROM users WHERE phone = ?`, [row.phone], (err, users) => {
                if (err) return;

                // Skip the first one (keep it original), update the rest
                const duplicates = users.slice(1);
                duplicates.forEach((user, index) => {
                    const newPhone = `${row.phone}_dup${index + 1}`;
                    db.run(`UPDATE users SET phone = ? WHERE id = ?`, [newPhone, user.id], (err) => {
                        if (err) console.error(err);
                        else console.log(`Updated user ${user.id} phone to ${newPhone}`);
                    });
                });
            });
        });
    });
});
