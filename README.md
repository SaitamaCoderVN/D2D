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
   - Supabase (PostgreSQL) for deployment tracking and analytics

3. **Frontend** (`frontend/`)
   - Next.js 14 with TypeScript
   - Solana wallet adapter integration
   - TailwindCSS for styling
   - Real-time deployment monitoring

## 📋 Prerequisites

- Node.js 18+ and pnpm/yarn/npm
- Rust and Cargo (for Solana program)
- Anchor CLI 0.29.0+
- Solana CLI 1.18+
- Supabase account (or PostgreSQL 14+)
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
pnpm install
# or npm install / yarn install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Run database migrations (Supabase)
# Go to your Supabase project and run the migration in supabase/migrations/001_initial_schema.sql

# Run in development mode
pnpm start:dev
# or npm run start:dev
```

#### Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Encryption (for storing deployer private keys)
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Solana Configuration
SOLANA_DEVNET_RPC=https://api.devnet.solana.com
SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com
SOLANA_CLI_PATH=solana

# D2D Program Configuration
D2D_PROGRAM_ID=Hn6enqRbfjQywqVbkNNFe6rauWjQLvea8Fyh6fZZPpA8
ADMIN_WALLET_PATH=./keys/admin-keypair.json
TREASURY_WALLET_ADDRESS=YOUR_TREASURY_WALLET_PUBLIC_KEY

# Fee Configuration
SERVICE_FEE_PERCENTAGE=0.5
MONTHLY_FEE_LAMPORTS=1000000000
```

**Important Notes:**
- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` can be found in your Supabase project settings
- `ENCRYPTION_KEY` should be a secure 32-character random string (use `openssl rand -hex 16`)
- `ADMIN_WALLET_PATH` should point to a keypair with authority to call admin functions on the D2D program
- `TREASURY_WALLET_ADDRESS` is where deployment fees are sent
- Generate admin keypair: `solana-keygen new -o ./keys/admin-keypair.json`

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

### 3-Phase Deployment Flow

The deployment process follows a secure 3-phase architecture:

#### **Phase 1: Verify Program** 🔍
1. User connects Solana wallet (Phantom, Solflare, etc.)
2. User enters devnet program ID
3. Backend verifies program exists on devnet
4. Validates program is executable

#### **Phase 2: Calculate Costs** 💰
1. Backend dumps program from devnet to analyze size
2. Calculates:
   - Rent exemption cost (based on program size)
   - Service fee (0.5% of rent cost)
   - Monthly subscription fee
   - Total payment required
3. Returns cost breakdown to frontend

#### **Phase 3: Execute Deployment** 🚀
1. **Payment**: User sends SOL payment to treasury wallet
2. **Verification**: Backend verifies payment transaction on-chain
3. **On-Chain Request**: Calls `deploy_program` instruction on D2D program
4. **Background Process**:
   - Dumps program from devnet
   - Deploys to mainnet using ephemeral keypair
   - Transfers program authority to D2D program
   - Confirms deployment success on-chain
5. **Completion**: User receives mainnet program ID and transaction links

### Architecture Benefits

- **Secure**: Ephemeral wallets for each deployment
- **Transparent**: All costs calculated upfront
- **Verifiable**: Every step recorded on-chain
- **Automated**: Background processing with real-time status updates

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

**Configuration**
- `GET /api/config/treasury` - Get treasury wallet and program configuration
- `GET /api/config/health` - Health check

**Deployment (3-Phase Flow)**
- `POST /api/deployments/verify` - Phase 1: Verify program on devnet
- `POST /api/deployments/calculate-cost` - Phase 2: Calculate deployment costs
- `POST /api/deployments/execute` - Phase 3: Execute deployment
- `GET /api/deployments/:id` - Get deployment details by ID
- `GET /api/deployments?userWalletAddress=<wallet>` - Get user's deployments

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

## 📊 Database Schema (Supabase/PostgreSQL)

### Deployments Table

```sql
CREATE TABLE deployments (
  id UUID PRIMARY KEY,
  user_wallet_address TEXT NOT NULL,
  devnet_program_id TEXT NOT NULL,
  mainnet_program_id TEXT,
  deployer_wallet_address TEXT NOT NULL,
  deployer_wallet_private_key TEXT NOT NULL, -- AES encrypted
  status TEXT NOT NULL, -- 'pending', 'dumping', 'deploying', 'success', 'failed'
  transaction_signature TEXT,
  payment_signature TEXT,
  on_chain_deploy_tx TEXT, -- deploy_program instruction tx
  on_chain_confirm_tx TEXT, -- confirm_deployment tx
  error_message TEXT,
  program_file_path TEXT,
  program_hash TEXT, -- SHA256 for PDA seed
  service_fee BIGINT NOT NULL,
  deployment_cost BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Deployment Logs Table

```sql
CREATE TABLE deployment_logs (
  id UUID PRIMARY KEY,
  deployment_id UUID REFERENCES deployments(id),
  phase TEXT NOT NULL, -- 'verify', 'calculate', 'execute', 'deploy', 'confirm'
  log_level TEXT NOT NULL, -- 'info', 'warn', 'error', 'debug'
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### User Stats Table

```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  total_deployments INTEGER DEFAULT 0,
  successful_deployments INTEGER DEFAULT 0,
  failed_deployments INTEGER DEFAULT 0,
  total_fees_paid BIGINT DEFAULT 0,
  first_deployment_at TIMESTAMPTZ,
  last_deployment_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Run the migration script in `backend/supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

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

