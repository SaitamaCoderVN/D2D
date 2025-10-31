# D2D - Decentralize Deployment

> **Deploy your Solana programs from Devnet to Mainnet with ease**

D2D is a comprehensive deployment service that automates the process of deploying Solana programs from devnet to mainnet. The system handles program dumping, wallet generation, and mainnet deployment, making it easy for developers to transition their programs to production.

## 🌟 Features

- **Automated Deployment**: Automatically dump programs from devnet and deploy to mainnet
- **Secure Wallet Management**: Generate fresh keypairs for each deployment
- **Real-time Tracking**: Monitor deployment status with live updates
- **Treasury Pool System**: Lenders can stake SOL to earn rewards from deployment fees
- **Modern UI**: Beautiful, responsive interface with dark mode support
- **Wallet Integration**: Full Solana wallet adapter support (Phantom, Solflare, etc.)

## 🏗️ Architecture

The project consists of three main components:

1. **Solana Program** (`programs/d2d-program-sol/`)
   - On-chain program handling deployment requests, treasury management, and staking
   - Built with Anchor framework
   - Handles service fees, subscription payments, and reward distribution

2. **Backend** (`backend/`)
   - NestJS REST API
   - Manages deployment orchestration
   - Interfaces with Solana CLI for program dumping and deployment
   - MongoDB for deployment tracking

3. **Frontend** (`frontend/`)
   - Next.js 14 with TypeScript
   - Solana wallet adapter integration
   - TailwindCSS for styling
   - Real-time deployment monitoring

## 📋 Prerequisites

- Node.js 18+ and yarn/npm
- Rust and Cargo (for Solana program)
- Anchor CLI 0.29.0+
- Solana CLI 1.18+
- MongoDB 6.0+
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/D2D.git
cd D2D
```

### 2. Setup Solana Program

```bash
cd programs/d2d-program-sol

# Install dependencies
yarn install

# Build the program
anchor build

# Run tests
anchor test

# Deploy to devnet (optional)
anchor deploy --provider.cluster devnet
```

### 3. Setup Backend

```bash
cd ../../backend

# Install dependencies
npm install
# or
yarn install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start MongoDB (if not running)
# mongod --dbpath /path/to/data

# Run in development mode
npm run start:dev
```

#### Backend Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/d2d

# Solana
SOLANA_DEVNET_RPC=https://api.devnet.solana.com
SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com
SOLANA_CLI_PATH=/usr/local/bin/solana

# Deployment
DEPLOYMENT_FEE_LAMPORTS=5000000000
MONTHLY_FEE_LAMPORTS=1000000000
DEPLOYMENT_COST_LAMPORTS=10000000000

# Admin
ADMIN_WALLET_PATH=/path/to/admin-keypair.json
TREASURY_WALLET_ADDRESS=YOUR_TREASURY_WALLET_ADDRESS

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install
# or
yarn install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local
nano .env.local

# Run in development mode
npm run dev
```

#### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

## 📖 How It Works

### Deployment Flow

1. **User Initiates Deployment**
   - User connects Solana wallet
   - Enters devnet program ID
   - Submits deployment request

2. **Backend Processing**
   - Validates program exists on devnet
   - Generates new deployer keypair
   - Creates deployment record in database

3. **Program Dumping**
   - Uses `solana program dump` to download program from devnet
   - Saves .so file temporarily

4. **Wallet Funding**
   - Admin treasury funds deployer wallet with deployment cost

5. **Mainnet Deployment**
   - Uses `solana program deploy` to deploy to mainnet
   - Records program ID and transaction signature

6. **Completion**
   - Updates deployment status
   - User can view mainnet program ID and transaction

### Treasury & Staking System

The on-chain program includes a sophisticated treasury system:

- **Lenders** can stake SOL into the treasury pool
- Staked SOL is used to fund deployments
- Lenders earn rewards from deployment fees (APY-based)
- Lock periods for higher rewards
- Flexible unstaking with reward claims

## 🧪 Testing

### Solana Program Tests

```bash
cd programs/d2d-program-sol
anchor test
```

The test suite includes:
- Treasury initialization
- Lender staking and unstaking
- Deployment requests
- Subscription payments
- Admin functions
- Edge cases and security tests

### Backend Tests

```bash
cd backend
npm run test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 📝 API Documentation

Once the backend is running, visit http://localhost:3001/api/docs for interactive Swagger documentation.

### Key Endpoints

- `POST /api/deployments` - Create a new deployment
- `GET /api/deployments` - Get deployments (query by user)
- `GET /api/deployments/:id` - Get deployment by ID

## 🎨 Frontend Features

- **Wallet Connection**: Supports all major Solana wallets
- **Deployment Form**: Simple interface to submit deployments
- **Real-time Updates**: Auto-refresh for pending deployments
- **Deployment History**: View all past deployments with status
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Transaction Links**: Direct links to Solana Explorer

## 🔐 Security Considerations

- **Never expose private keys** in code or version control
- Use environment variables for sensitive configuration
- Admin wallet should be stored securely (hardware wallet recommended)
- In production, encrypt deployer private keys in database
- Implement rate limiting on API endpoints
- Validate all user inputs
- Use HTTPS in production

## 🚢 Production Deployment

### Backend (NestJS)

```bash
# Build
npm run build

# Run production server
npm run start:prod
```

Consider deploying to:
- AWS EC2 / Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform
- Heroku

### Frontend (Next.js)

```bash
# Build
npm run build

# Run production server
npm run start
```

Recommended platforms:
- Vercel (optimized for Next.js)
- Netlify
- AWS Amplify
- Cloudflare Pages

### Solana Program

```bash
# Build for mainnet
anchor build --verifiable

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

## 📊 Database Schema

### Deployment Collection

```typescript
{
  userWalletAddress: string;
  devnetProgramId: string;
  mainnetProgramId?: string;
  deployerWalletAddress: string;
  deployerWalletPrivateKey: string; // Encrypted in production
  status: 'pending' | 'dumping' | 'deploying' | 'success' | 'failed';
  transactionSignature?: string;
  errorMessage?: string;
  programFilePath?: string;
  serviceFee: number;
  deploymentCost: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🛠️ Development

### Project Structure

```
D2D/
├── programs/
│   └── d2d-program-sol/     # Anchor Solana program
│       ├── programs/        # Program source code
│       ├── tests/          # Program tests
│       └── target/         # Build artifacts
├── backend/                # NestJS backend
│   ├── src/
│   │   ├── deployment/    # Deployment module
│   │   ├── wallet/        # Wallet service
│   │   └── main.ts        # Entry point
│   └── temp/              # Temporary program files
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets
└── docs/                 # Documentation
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Anchor Framework](https://www.anchor-lang.com/)
- UI inspired by modern Web3 applications
- Thanks to the Solana community for excellent tooling

## 📞 Support

For questions or support:
- Create an issue on GitHub
- Join our Discord community
- Email: support@d2d.example.com

## 🗺️ Roadmap

- [ ] Multi-program batch deployments
- [ ] Program upgrade support
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Webhook integrations
- [ ] Program verification service
- [ ] IDL storage and management
- [ ] Deployment cost estimation
- [ ] Rollback functionality
- [ ] Custom RPC endpoint support

---

**Built with ❤️ for the Solana ecosystem**

