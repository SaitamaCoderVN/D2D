import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import { Deployment, DeploymentSchema } from './entities/deployment.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Deployment.name, schema: DeploymentSchema },
    ]),
    WalletModule,
  ],
  controllers: [DeploymentController],
  providers: [DeploymentService],
  exports: [DeploymentService],
})
export class DeploymentModule {}

