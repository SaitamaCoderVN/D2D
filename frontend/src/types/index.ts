export enum DeploymentStatus {
  PENDING = 'pending',
  DUMPING = 'dumping',
  DEPLOYING = 'deploying',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface Deployment {
  _id?: string;
  id?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeploymentRequest {
  userWalletAddress: string;
  devnetProgramId: string;
  paymentSignature?: string;
}

