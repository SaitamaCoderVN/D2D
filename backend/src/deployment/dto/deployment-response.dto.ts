import { ApiProperty } from '@nestjs/swagger';
import { DeploymentStatus } from '../entities/deployment.entity';

export class DeploymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userWalletAddress: string;

  @ApiProperty()
  devnetProgramId: string;

  @ApiProperty({ required: false })
  mainnetProgramId?: string;

  @ApiProperty()
  deployerWalletAddress: string;

  @ApiProperty({ enum: DeploymentStatus })
  status: DeploymentStatus;

  @ApiProperty({ required: false })
  transactionSignature?: string;

  @ApiProperty({ required: false })
  errorMessage?: string;

  @ApiProperty()
  serviceFee: number;

  @ApiProperty()
  deploymentCost: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
