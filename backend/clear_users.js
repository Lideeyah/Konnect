const { db } = require('./db');

db.serialize(() => {
    console.log("Clearing user data...");

    // Delete dependent tables first to avoid FK constraints
    db.run("DELETE FROM transactions", (err) => {
        if (err) console.error("Error clearing transactions:", err);
    });
    db.run("DELETE FROM messages", (err) => {
        if (err) console.error("Error clearing messages:", err);
    });
    db.run("DELETE FROM escrows", (err) => {
        if (err) console.error("Error clearing escrows:", err);
    });
    db.run("DELETE FROM orders", (err) => {
        if (err) console.error("Error clearing orders:", err);
    });
    db.run("DELETE FROM listings", (err) => {
        if (err) console.error("Error clearing listings:", err);
    });
    db.run("DELETE FROM wallets", (err) => {
        if (err) console.error("Error clearing wallets:", err);
    });

    // Finally delete users
    db.run("DELETE FROM users", (err) => {
        if (err) console.error("Error clearing users:", err);
        else console.log("All user accounts and related data cleared. Marketplaces preserved.");
    });
});
