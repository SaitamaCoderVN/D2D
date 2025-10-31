import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeploymentSimpleModule } from './deployment-simple/deployment-simple.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DeploymentSimpleModule,
  ],
})
export class AppSimpleModule {}

