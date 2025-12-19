const { db } = require('./db');

db.serialize(() => {
    // Add Bank Details and Solana Wallet to Users
    const columns = [
        "ALTER TABLE users ADD COLUMN bank_name TEXT",
        "ALTER TABLE users ADD COLUMN account_number TEXT",
        "ALTER TABLE users ADD COLUMN account_name TEXT",
        "ALTER TABLE users ADD COLUMN solana_wallet_address TEXT"
    ];

    columns.forEach(query => {
        db.run(query, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error("Error adding column:", err.message);
            } else {
                console.log("Column added successfully or already exists.");
            }
        });
    });

    // Update Admin User with provided details
    const bankName = "Opay Digital Services Limited";
    const accNum = "6418554802";
    const accName = "Lydia Ebunoluwa Solomon";
    const adminEmail = "admin@konnect.com";

    db.run(
        `UPDATE users SET bank_name = ?, account_number = ?, account_name = ? WHERE email = ?`,
        [bankName, accNum, accName, adminEmail],
        function (err) {
            if (err) console.error("Error updating admin bank details:", err);
            else console.log(`Admin bank details updated. Rows affected: ${this.changes}`);
        }
    );
});
