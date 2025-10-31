import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { Deployment, DeploymentStatus } from './entities/deployment.entity';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { WalletService } from '../wallet/wallet.service';

const execAsync = promisify(exec);

@Injectable()
export class DeploymentService {
  private readonly logger = new Logger(DeploymentService.name);
  private devnetConnection: Connection;
  private mainnetConnection: Connection;
  private tempDir: string;

  constructor(
    @InjectModel(Deployment.name) private deploymentModel: Model<Deployment>,
    private walletService: WalletService,
  ) {
    this.devnetConnection = new Connection(
      process.env.SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
      'confirmed',
    );
    this.mainnetConnection = new Connection(
      process.env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com',
      'confirmed',
    );
    this.tempDir = path.join(process.cwd(), 'temp');

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Create a new deployment request
   */
  async createDeployment(createDeploymentDto: CreateDeploymentDto): Promise<Deployment> {
    this.logger.log(`Creating deployment for program: ${createDeploymentDto.devnetProgramId}`);

    // Verify program exists on devnet
    await this.verifyProgramExists(createDeploymentDto.devnetProgramId);

    // Generate new deployer wallet
    const { publicKey, privateKey } = this.walletService.generateKeypair();

    const deployment = new this.deploymentModel({
      userWalletAddress: createDeploymentDto.userWalletAddress,
      devnetProgramId: createDeploymentDto.devnetProgramId,
      deployerWalletAddress: publicKey,
      deployerWalletPrivateKey: privateKey,
      status: DeploymentStatus.PENDING,
      serviceFee: parseInt(process.env.DEPLOYMENT_FEE_LAMPORTS || '5000000000'),
      deploymentCost: parseInt(process.env.DEPLOYMENT_COST_LAMPORTS || '10000000000'),
    });

    const savedDeployment = await deployment.save();

    // Start deployment process in background
    this.processDeployment(savedDeployment._id.toString()).catch((error) => {
      this.logger.error(`Deployment process failed: ${error.message}`);
    });

    return savedDeployment;
  }

  /**
   * Get all deployments for a user
   */
  async getDeploymentsByUser(userWalletAddress: string): Promise<Deployment[]> {
    return this.deploymentModel
      .find({ userWalletAddress })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get deployment by ID
   */
  async getDeploymentById(id: string): Promise<Deployment> {
    const deployment = await this.deploymentModel.findById(id).exec();
    
    if (!deployment) {
      throw new NotFoundException(`Deployment with ID ${id} not found`);
    }

    return deployment;
  }

  /**
   * Get all deployments (admin only)
   */
  async getAllDeployments(): Promise<Deployment[]> {
    return this.deploymentModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Verify that program exists on devnet
   */
  private async verifyProgramExists(programId: string): Promise<void> {
    try {
      const publicKey = new PublicKey(programId);
      const accountInfo = await this.devnetConnection.getAccountInfo(publicKey);

      if (!accountInfo) {
        throw new Error('Program not found on devnet');
      }

      if (!accountInfo.executable) {
        throw new Error('Account is not an executable program');
      }

      this.logger.log(`Verified program exists on devnet: ${programId}`);
    } catch (error) {
      this.logger.error(`Program verification failed: ${error.message}`);
      throw new Error(`Invalid program ID or program not found on devnet: ${error.message}`);
    }
  }

  /**
   * Process deployment (background task)
   */
  private async processDeployment(deploymentId: string): Promise<void> {
    try {
      const deployment = await this.deploymentModel.findById(deploymentId);
      
      if (!deployment) {
        throw new Error('Deployment not found');
      }

      // Step 1: Dump program from devnet
      this.logger.log(`[${deploymentId}] Step 1: Dumping program from devnet...`);
      await this.updateDeploymentStatus(deploymentId, DeploymentStatus.DUMPING);
      const programFilePath = await this.dumpProgramFromDevnet(deployment.devnetProgramId);
      
      await this.deploymentModel.findByIdAndUpdate(deploymentId, {
        programFilePath,
      });

      // Step 2: Fund deployer wallet
      this.logger.log(`[${deploymentId}] Step 2: Funding deployer wallet...`);
      await this.fundDeployerWallet(deployment.deployerWalletAddress, deployment.deploymentCost);

      // Step 3: Deploy to mainnet
      this.logger.log(`[${deploymentId}] Step 3: Deploying to mainnet...`);
      await this.updateDeploymentStatus(deploymentId, DeploymentStatus.DEPLOYING);
      const { programId, signature } = await this.deployToMainnet(
        programFilePath,
        deployment.deployerWalletPrivateKey,
      );

      // Step 4: Update success status
      this.logger.log(`[${deploymentId}] Step 4: Deployment successful!`);
      await this.deploymentModel.findByIdAndUpdate(deploymentId, {
        status: DeploymentStatus.SUCCESS,
        mainnetProgramId: programId,
        transactionSignature: signature,
      });

      // Cleanup
      this.cleanupTempFile(programFilePath);

      this.logger.log(`[${deploymentId}] Deployment completed successfully. Program ID: ${programId}`);
    } catch (error) {
      this.logger.error(`[${deploymentId}] Deployment failed: ${error.message}`);
      
      await this.deploymentModel.findByIdAndUpdate(deploymentId, {
        status: DeploymentStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }

  /**
   * Dump program from devnet using Solana CLI
   */
  private async dumpProgramFromDevnet(programId: string): Promise<string> {
    const outputPath = path.join(this.tempDir, `${programId}.so`);
    const solanaCliPath = process.env.SOLANA_CLI_PATH || 'solana';

    try {
      const command = `${solanaCliPath} program dump -u devnet ${programId} ${outputPath}`;
      this.logger.log(`Executing: ${command}`);

      const { stdout, stderr } = await execAsync(command, {
        timeout: 120000, // 2 minutes timeout
      });

      if (stderr && !stderr.includes('Wrote')) {
        this.logger.warn(`Dump stderr: ${stderr}`);
      }

      this.logger.log(`Dump stdout: ${stdout}`);

      // Verify file was created
      if (!fs.existsSync(outputPath)) {
        throw new Error('Program dump file was not created');
      }

      const stats = fs.statSync(outputPath);
      this.logger.log(`Program dumped successfully. File size: ${stats.size} bytes`);

      return outputPath;
    } catch (error) {
      this.logger.error(`Failed to dump program: ${error.message}`);
      throw new Error(`Failed to dump program from devnet: ${error.message}`);
    }
  }

  /**
   * Fund deployer wallet with SOL from admin wallet
   */
  private async fundDeployerWallet(deployerAddress: string, amount: number): Promise<void> {
    try {
      const adminKeypair = this.walletService.loadAdminKeypair();
      const deployerPublicKey = new PublicKey(deployerAddress);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: adminKeypair.publicKey,
          toPubkey: deployerPublicKey,
          lamports: amount,
        }),
      );

      const signature = await sendAndConfirmTransaction(
        this.mainnetConnection,
        transaction,
        [adminKeypair],
        {
          commitment: 'confirmed',
        },
      );

      this.logger.log(`Funded deployer wallet. Transaction: ${signature}`);
    } catch (error) {
      this.logger.error(`Failed to fund deployer wallet: ${error.message}`);
      throw new Error(`Failed to fund deployer wallet: ${error.message}`);
    }
  }

  /**
   * Deploy program to mainnet using Solana CLI
   */
  private async deployToMainnet(
    programFilePath: string,
    deployerPrivateKey: string,
  ): Promise<{ programId: string; signature: string }> {
    try {
      const deployerKeypair = this.walletService.loadKeypairFromPrivateKey(deployerPrivateKey);
      const solanaCliPath = process.env.SOLANA_CLI_PATH || 'solana';

      // Save deployer keypair to temp file
      const keypairPath = path.join(this.tempDir, `deployer-${Date.now()}.json`);
      fs.writeFileSync(keypairPath, JSON.stringify(Array.from(deployerKeypair.secretKey)));

      try {
        // Deploy program
        const command = `${solanaCliPath} program deploy -u mainnet-beta --keypair ${keypairPath} ${programFilePath}`;
        this.logger.log(`Executing deployment command...`);

        const { stdout, stderr } = await execAsync(command, {
          timeout: 300000, // 5 minutes timeout
        });

        this.logger.log(`Deploy stdout: ${stdout}`);
        
        if (stderr) {
          this.logger.warn(`Deploy stderr: ${stderr}`);
        }

        // Extract program ID from output
        const programIdMatch = stdout.match(/Program Id: ([1-9A-HJ-NP-Za-km-z]{32,44})/);
        
        if (!programIdMatch) {
          throw new Error('Could not extract program ID from deployment output');
        }

        const programId = programIdMatch[1];

        // Get recent transaction (signature) - this is a simplified approach
        // In production, you might want to parse it from the CLI output
        const signature = 'deployment-tx-' + Date.now(); // Placeholder

        return { programId, signature };
      } finally {
        // Cleanup keypair file
        if (fs.existsSync(keypairPath)) {
          fs.unlinkSync(keypairPath);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to deploy to mainnet: ${error.message}`);
      throw new Error(`Failed to deploy to mainnet: ${error.message}`);
    }
  }

  /**
   * Update deployment status
   */
  private async updateDeploymentStatus(
    deploymentId: string,
    status: DeploymentStatus,
  ): Promise<void> {
    await this.deploymentModel.findByIdAndUpdate(deploymentId, { status });
  }

  /**
   * Cleanup temporary files
   */
  private cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Cleaned up temp file: ${filePath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup temp file: ${error.message}`);
    }
  }
}

