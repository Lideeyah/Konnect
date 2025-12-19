# Konnect 🔗

**The Trust-First Campus Marketplace on Solana**

> *Bridging the gap between physical campus commerce and digital security.*

![Konnect Banner](https://via.placeholder.com/1200x400?text=Konnect+Marketplace)

---

## 🚩 The Problem
Trading on campus is broken. Students rely on fragmented WhatsApp groups, bulletin boards, and shady DMs to buy and sell textbooks, gadgets, and services.
*   **Lack of Trust**: "Will they actually pay?" "Is the item real?"
*   **Safety Concerns**: Meeting strangers for cash exchanges can be risky.
*   **Scams**: Fake proofs of payment and ghosting are rampant.
*   **Inefficiency**: Haggling in DMs and coordinating meetups is a waste of time.

## ✅ The Solution: Konnect
Konnect is not just another classifieds app. It is a **secure, escrow-based marketplace** built specifically for university students. We combine verify-able student identities with blockchain technology to guarantee that **no one gets scammed.**

1.  **Identity First**: Users must verify their student status, creating a closed loop of trusted peers.
2.  **Escrow Security**: Funds are locked in a smart contract before the exchange happens.
3.  **Seamless Experience**: A modern, glossy UI that feels like the apps you use every day, hiding the complexity of blockchain under the hood.

---

## ⚡ Why Solana?
We chose **Solana** not just for the hype, but for the fundamental technical advantages it brings to a high-volume, peer-to-peer marketplace:

*   **Atomic Escrow**: We utilize Solana's specialized capabilities to hold funds (USDC/SOL) in a secure intermediate account. The seller sees the funds are locked *before* they hand over the item. The buyer knows their money effectively "waits" for them to confirm receipt.
*   **Instant Finality**: When you click "Item Received", the seller gets paid in *milliseconds*. No banking delays, no "2-3 business days".
*   **Negligible Fees**: Transaction costs are a fraction of a penny, making it viable to sell low-value items like used textbooks or coffee vouchers without fees eating the profit.
*   **Web3 Integration**: Seamless wallet connection (Phantom, Solflare) allows for meaningful ownership and potential future features like NFT-based tickets or student loyalty tokens.

---

## 🌟 Key Features

*   **🛡️ Trustless Escrow System**: The core of Konnect. Buyers deposit funds => Konnect holds them => Seller delivers => Buyer confirms => Funds released.
*   **🎓 Student Verification**: (Coming Soon) Integration with campus email systems to ensure every user is a real student.
*   **📍 Campus-Specific Feeds**: Automatically see listings only from your university or nearby campuses.
*   **💬 Integrated Chat**: Negotiate and arrange meetups securely without sharing personal phone numbers.
*   **⭐ Reputation & Gamification**: Earn "Trust Score" points for every successful trade. High-trust users get badges and better visibility.

---

## 🛠️ Technical Architecture

Konnect employs a **Hybrid Web3 Architecture**, leveraging the best of traditional web tech for user experience and blockchain for value transfer.

### Frontend
*   **Framework**: Next.js 15 (App Router) for a blisteringly fast React application.
*   **Styling**: Tailwind CSS & Framer Motion for a premium, "glassmorphic" aesthetic.
*   **State Management**: Zustand & React Context.
*   **Wallet Adapter**: `@solana/wallet-adapter-react` for universal wallet support.

### Backend
*   **API**: Express.js & Node.js serving a RESTful API.
*   **Database**: PostgreSQL for robust data storage (Users, Listings, Chat History, Metadata).
*   **Blockchain Interaction**: `@solana/web3.js` and `@solana/spl-token` running on the server to monitor escrow states and verify on-chain events.
*   **Security**: JWT authentication for API access, ensuring user sessions are secure.

---

## 🚀 Getting Started

Experience the future of campus trading locally.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16+)
*   [PostgreSQL](https://www.postgresql.org/)
*   A Solana Wallet (e.g., Phantom) set to **Devnet**.

### 1. Installation
Clones the repo and install dependencies for both the client and server.

```bash
git clone https://github.com/Lideeyah/Konnect.git
cd Konnect

# Install Backend Deps
cd backend
npm install

# Install Frontend Deps
cd ../frontend
npm install
```

### 2. Configuration
**Backend (`backend/.env`)**
```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/konnect_db
JWT_SECRET=supersecretkey
SOLANA_RPC_URL=https://api.devnet.solana.com
# Wallet Secret Key for the Escrow Authority (JSON array format)
ESCROW_WALLET_SECRET=[...] 
```

**Frontend (`frontend/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### 3. Run It
Open two terminals.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Visit `http://localhost:3000` to start trading!

---

## 🤝 Contributing
We are building for the community, by the community.
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
