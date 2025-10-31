import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export enum DeploymentStatus {
  PENDING = 'pending',
  DUMPING = 'dumping',
  DEPLOYING = 'deploying',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface Deployment {
  id: string;
  userWalletAddress: string;
  devnetProgramId: string;
  mainnetProgramId?: string;
  deployerWalletAddress: string;
  status: DeploymentStatus;
  paymentSignature?: string;
  transactionSignature?: string;
  errorMessage?: string;
  serviceFee: number;
  deploymentCost: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DeploymentSimpleService {
  private readonly logger = new Logger(DeploymentSimpleService.name);
  private deployments: Map<string, Deployment> = new Map();
  private idCounter = 1;

  async createDeployment(data: {
    userWalletAddress: string;
    devnetProgramId: string;
    paymentSignature?: string;
  }): Promise<Deployment> {
    this.logger.log(`Creating deployment for program: ${data.devnetProgramId}`);
    this.logger.log(`Payment signature: ${data.paymentSignature || 'N/A'}`);

    const id = `deploy_${this.idCounter++}`;
    const deployerWallet = this.generateMockWallet();

    const deployment: Deployment = {
      id,
      userWalletAddress: data.userWalletAddress,
      devnetProgramId: data.devnetProgramId,
      mainnetProgramId: undefined,
      deployerWalletAddress: deployerWallet,
      status: DeploymentStatus.PENDING,
      paymentSignature: data.paymentSignature,
      transactionSignature: undefined,
      serviceFee: 25000000, // $5 ≈ 0.025 SOL in lamports (assuming SOL=$200)
      deploymentCost: 1200000000, // ~1.2 SOL for rent-exempt (86KB program = 172,414 bytes)
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.deployments.set(id, deployment);

    // Simulate deployment process
    this.simulateDeployment(id);

    return deployment;
  }

  async getDeploymentsByUser(userWalletAddress: string): Promise<Deployment[]> {
    const userDeployments = Array.from(this.deployments.values()).filter(
      (d) => d.userWalletAddress === userWalletAddress,
    );
    return userDeployments.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async getDeploymentById(id: string): Promise<Deployment> {
    const deployment = this.deployments.get(id);
    if (!deployment) {
      throw new NotFoundException(`Deployment with ID ${id} not found`);
    }
    return deployment;
  }

  async getAllDeployments(): Promise<Deployment[]> {
    return Array.from(this.deployments.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  private generateMockWallet(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async simulateDeployment(id: string) {
    const deployment = this.deployments.get(id);
    if (!deployment) return;

    this.logger.log(`🚀 [${id}] Starting deployment simulation...`);

    // Step 1: Pending -> Dumping (simulate fetching .so from devnet)
    setTimeout(() => {
      if (this.deployments.has(id)) {
        deployment.status = DeploymentStatus.DUMPING;
        deployment.updatedAt = new Date();
        this.logger.log(`📥 [${id}] DUMPING - Fetching .so file from devnet...`);
      }
    }, 3000); // 3 seconds

    // Step 2: Dumping -> Deploying (simulate uploading and deploying to mainnet)
    setTimeout(() => {
      if (this.deployments.has(id)) {
        deployment.status = DeploymentStatus.DEPLOYING;
        deployment.updatedAt = new Date();
        this.logger.log(`🔨 [${id}] DEPLOYING - Uploading to mainnet and deploying...`);
      }
    }, 7000); // 7 seconds total (3 + 4)

    // Step 3: Deploying -> Success (+3s delay)
    setTimeout(() => {
      if (this.deployments.has(id)) {
        deployment.status = DeploymentStatus.SUCCESS;
        deployment.mainnetProgramId = this.generateMockWallet();
        deployment.transactionSignature = this.generateMockSignature();
        deployment.updatedAt = new Date();
        this.logger.log(
          `✅ [${id}] SUCCESS!\n` +
          `   Mainnet Program: ${deployment.mainnetProgramId}\n` +
          `   Transaction: ${deployment.transactionSignature}`,
        );
      }
    }, 15000); // 15 seconds total (3 + 4 + 5 + 3 extra)
  }

  private generateMockSignature(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

