import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeploymentDto {
  @ApiProperty({
    description: 'User wallet address (for tracking only)',
    example: 'Hs4Hxe7k43p4YJqqyRnhoXboBB7MCzN8QpqW9NXuSrF8',
  })
  @IsNotEmpty()
  @IsString()
  userWalletAddress: string;

  @ApiProperty({
    description: 'Devnet program ID to deploy to mainnet',
    example: '5aai4VhRLDCFP2WSHUbGsiSuZxkWzQahhsRkqdfF2jRh',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, {
    message: 'Invalid Solana program ID format',
  })
  devnetProgramId: string;
}


