const { db } = require('./db');

db.serialize(() => {
    // Delete Demo Listing
    db.run(`DELETE FROM listings WHERE id = 1`, (err) => {
        if (err) console.error(err);
        else console.log("Deleted Demo Listing (ID 1)");
    });

    // Delete Demo User
    db.run(`DELETE FROM users WHERE id = 999`, (err) => {
        if (err) console.error(err);
        else console.log("Deleted Demo User (ID 999)");
    });
});
