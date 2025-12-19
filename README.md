# Konnect 🚀

**The Safest Way to Buy & Sell on Campus**

Konnect is a secure, student-first marketplace platform designed to bridge the trust gap in campus commerce. Built with safety and speed in mind, Konnect uses blockchain technology to ensure fair exchanges and instant settlements between verified students.

![Konnect Banner](https://via.placeholder.com/1200x400?text=Konnect+Marketplace)

---

## 🌟 Key Features

*   **🛡️ 100% Secure Payments**: Funds are secured via an escrow system, ensuring sellers get paid and buyers get what they expect.
*   **⚡ Instant Settlement**: Powered by Solana, transactions settle instantly upon confirmation.
*   **🎓 Verified Student Community**: Trade with confidence knowing every user is a verified student at your campus.
*   **💬 Integrated Messaging**: Communicate securely with buyers and sellers directly within the app.
*   **⭐ Reputation System**: Build trust through a comprehensive review and gamification system.
*   **📱 Seamless Wallet Integration**: Easy connection with Solana wallets for managing funds.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Blockchain Integration**: `@solana/wallet-adapter-react`, `@solana/web3.js`
*   **UI Components**: Lucide React

### Backend
*   **Runtime**: Node.js
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: PostgreSQL
*   **Blockchain**: `@solana/web3.js`, `@solana/spl-token`
*   **Authentication**: JWT, bcryptjs
*   **File Uploads**: Multer

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [PostgreSQL](https://www.postgresql.org/)
*   A Solana Wallet (e.g., Phantom, Solflare)

### 1. Clone the Repository
```bash
git clone https://github.com/Lideeyah/Konnect.git
cd Konnect
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=4000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
SOLANA_RPC_URL=https://api.devnet.solana.com
# Add any other required keys (e.g. Email service credentials)
```

**Start the Server:**
```bash
npm run dev
# Server will run on http://localhost:4000
```

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

**Environment Variables:**
Create a `.env.local` file in the `frontend` directory if needed (check `next.config.ts` or source code for required public vars).

**Start the Development Server:**
```bash
npm run dev
# App will operate on http://localhost:3000
```

---

## 📂 Project Structure

```
Konnect/
├── backend/             # Express.js API & Business Logic
│   ├── routes/          # API Routes (Auth, Marketplaces, Orders, etc.)
│   ├── db/              # Database connection
│   ├── escrowWallet/    # Wallet logic for escrow
│   └── server.js        # Entry point
│
├── frontend/            # Next.js Application
│   ├── src/
│   │   ├── app/         # App Router Pages
│   │   ├── components/  # Reusable UI Components
│   │   └── lib/         # Utility functions
│   └── public/          # Static assets
│
└── README.md            # Project Documentation
```

---

## 🤝 Contributing

Contributions are always welcome!
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the ISC License.
