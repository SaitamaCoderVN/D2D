import { Module } from '@nestjs/common';
import { DeploymentSimpleController } from './deployment-simple.controller';
import { DeploymentSimpleService } from './deployment-simple.service';

@Module({
  controllers: [DeploymentSimpleController],
  providers: [DeploymentSimpleService],
  exports: [DeploymentSimpleService],
})
export class DeploymentSimpleModule {}

