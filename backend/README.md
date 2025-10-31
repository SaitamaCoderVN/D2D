# D2D Backend API

NestJS-based backend service for managing Solana program deployments from devnet to mainnet.

## Features

- RESTful API for deployment management
- Automated Solana program dumping from devnet
- Mainnet deployment orchestration
- MongoDB integration for deployment tracking
- Solana wallet generation and management
- Swagger API documentation

## Installation

```bash
npm install
# or
yarn install
```

## Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/d2d

# Solana Configuration
SOLANA_DEVNET_RPC=https://api.devnet.solana.com
SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com
SOLANA_CLI_PATH=/usr/local/bin/solana

# Deployment Configuration
DEPLOYMENT_FEE_LAMPORTS=5000000000
MONTHLY_FEE_LAMPORTS=1000000000
DEPLOYMENT_COST_LAMPORTS=10000000000

# Admin Configuration
ADMIN_WALLET_PATH=/path/to/admin-keypair.json
TREASURY_WALLET_ADDRESS=YOUR_TREASURY_WALLET_ADDRESS

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

## Running the App

```bash
# Development
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Watch mode
npm run start:debug
```

## API Endpoints

### Create Deployment

```http
POST /api/deployments
Content-Type: application/json

{
  "userWalletAddress": "Hs4Hxe7k43p4YJqqyRnhoXboBB7MCzN8QpqW9NXuSrF8",
  "devnetProgramId": "5aai4VhRLDCFP2WSHUbGsiSuZxkWzQahhsRkqdfF2jRh"
}
```

### Get Deployments by User

```http
GET /api/deployments?userWalletAddress=Hs4Hxe7k43p4YJqqyRnhoXboBB7MCzN8QpqW9NXuSrF8
```

### Get Deployment by ID

```http
GET /api/deployments/:id
```

## API Documentation

Once running, access interactive API documentation at:
- Swagger UI: http://localhost:3001/api/docs

## Architecture

### Modules

- **DeploymentModule**: Handles deployment logic and API endpoints
- **WalletModule**: Manages Solana wallet operations
- **AppModule**: Root module with configuration

### Services

- **DeploymentService**: Orchestrates the deployment process
- **WalletService**: Generates and manages Solana keypairs

## Deployment Flow

1. **Request Creation**
   - Validates devnet program ID
   - Generates deployer keypair
   - Creates database record

2. **Program Dumping**
   - Executes `solana program dump` command
   - Saves .so file to temp directory

3. **Wallet Funding**
   - Admin wallet transfers deployment cost to deployer

4. **Mainnet Deployment**
   - Executes `solana program deploy` command
   - Captures program ID and transaction signature

5. **Status Updates**
   - Updates deployment status in database
   - Provides real-time status to frontend

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development

### Adding New Features

1. Create module: `nest g module feature`
2. Create service: `nest g service feature`
3. Create controller: `nest g controller feature`

### Database Models

Models are defined using Mongoose schemas in `src/deployment/entities/`.

## Troubleshooting

### Solana CLI Not Found

Ensure Solana CLI is installed and `SOLANA_CLI_PATH` is correctly set:

```bash
which solana
```

### MongoDB Connection Issues

Verify MongoDB is running:

```bash
mongosh
```

### Deployment Failures

Check logs for detailed error messages:

```bash
npm run start:dev
```

## Production Considerations

- Use environment-specific configuration files
- Implement proper logging (Winston, Pino)
- Add rate limiting middleware
- Encrypt sensitive data in database
- Use process managers (PM2, systemd)
- Set up monitoring (DataDog, New Relic)
- Implement proper error handling
- Add request validation
- Use connection pooling for MongoDB

## License

MIT

