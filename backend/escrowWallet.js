const { Keypair, Connection, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

// PERSISTENT KEYPAIR
let keypair;
if (process.env.SOLANA_PRIVATE_KEY) {
    try {
        const secretKey = Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY));
        keypair = Keypair.fromSecretKey(secretKey);
    } catch (e) {
        console.error("Invalid SOLANA_PRIVATE_KEY, generating random one:", e);
        keypair = Keypair.generate();
    }
} else {
    console.warn("No SOLANA_PRIVATE_KEY found, generating random one.");
    keypair = Keypair.generate();
}

// Connection to Mainnet
const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

// Platform Fee Wallet (Replace with your actual wallet address)
// Using a fixed public key for now to avoid errors
const platformFeeWallet = new PublicKey("KonnectFeeWalletAddress11111111111111111111");

console.log("---------------------------------------------------");
console.log("ESCROW WALLET PUBLIC KEY:", keypair.publicKey.toString());
console.log("PLATFORM FEE WALLET:", platformFeeWallet.toString());
console.log("---------------------------------------------------");

module.exports = {
    escrowKeypair: keypair,
    connection,
    platformFeeWallet
};
