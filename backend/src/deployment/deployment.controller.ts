import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeploymentService } from './deployment.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { DeploymentResponseDto } from './dto/deployment-response.dto';

@ApiTags('deployments')
@Controller('api/deployments')
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new deployment request' })
  @ApiResponse({ 
    status: 201, 
    description: 'Deployment created successfully',
    type: DeploymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createDeployment(@Body() createDeploymentDto: CreateDeploymentDto) {
    return this.deploymentService.createDeployment(createDeploymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get deployments by user wallet address' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of deployments',
    type: [DeploymentResponseDto],
  })
  async getDeployments(@Query('userWalletAddress') userWalletAddress?: string) {
    if (userWalletAddress) {
      return this.deploymentService.getDeploymentsByUser(userWalletAddress);
    }
    return this.deploymentService.getAllDeployments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deployment by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Deployment details',
    type: DeploymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Deployment not found' })
  async getDeployment(@Param('id') id: string) {
    return this.deploymentService.getDeploymentById(id);
  }
}

