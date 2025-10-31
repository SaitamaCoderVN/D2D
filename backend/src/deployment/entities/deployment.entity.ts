import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum DeploymentStatus {
  PENDING = 'pending',
  DUMPING = 'dumping',
  DEPLOYING = 'deploying',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Deployment extends Document {
  @Prop({ required: true })
  userWalletAddress: string;

  @Prop({ required: true })
  devnetProgramId: string;

  @Prop({ required: false })
  mainnetProgramId?: string;

  @Prop({ required: true })
  deployerWalletAddress: string;

  @Prop({ required: true })
  deployerWalletPrivateKey: string; // Encrypted in production

  @Prop({ 
    required: true, 
    enum: DeploymentStatus, 
    default: DeploymentStatus.PENDING 
  })
  status: DeploymentStatus;

  @Prop({ required: false })
  transactionSignature?: string;

  @Prop({ required: false })
  errorMessage?: string;

  @Prop({ required: false })
  programFilePath?: string;

  @Prop({ required: true, default: 5 * 1_000_000_000 })
  serviceFee: number; // in lamports

  @Prop({ required: true, default: 10 * 1_000_000_000 })
  deploymentCost: number; // in lamports

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const DeploymentSchema = SchemaFactory.createForClass(Deployment);


