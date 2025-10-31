import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeploymentSimpleService } from './deployment-simple.service';

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

class CreateDeploymentDto {
  @IsString()
  @IsNotEmpty()
  userWalletAddress: string;

  @IsString()
  @IsNotEmpty()
  devnetProgramId: string;

  @IsString()
  @IsOptional()
  paymentSignature?: string;
}

@ApiTags('deployments')
@Controller('api/deployments')
export class DeploymentSimpleController {
  constructor(
    private readonly deploymentService: DeploymentSimpleService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a new deployment request' })
  @ApiResponse({ status: 201, description: 'Deployment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createDeployment(@Body() createDeploymentDto: CreateDeploymentDto) {
    console.log('Received deployment request:', createDeploymentDto);
    return this.deploymentService.createDeployment(createDeploymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get deployments by user wallet address' })
  @ApiResponse({ status: 200, description: 'List of deployments' })
  async getDeployments(@Query('userWalletAddress') userWalletAddress?: string) {
    if (userWalletAddress) {
      return this.deploymentService.getDeploymentsByUser(userWalletAddress);
    }
    return this.deploymentService.getAllDeployments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deployment by ID' })
  @ApiResponse({ status: 200, description: 'Deployment details' })
  @ApiResponse({ status: 404, description: 'Deployment not found' })
  async getDeployment(@Param('id') id: string) {
    return this.deploymentService.getDeploymentById(id);
  }
}

