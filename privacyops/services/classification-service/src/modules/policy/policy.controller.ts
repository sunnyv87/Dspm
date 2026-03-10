import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { TestPolicyDto } from './dto/test-policy.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Classification Policies')
@ApiBearerAuth('bearer')
@Controller('policies')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post()
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Create a classification policy' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  @ApiResponse({ status: 409, description: 'Policy with this name already exists' })
  create(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreatePolicyDto,
  ) {
    return this.policyService.create(tenantId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all classification policies for tenant' })
  @ApiResponse({ status: 200, description: 'List of policies' })
  findAll(@TenantId() tenantId: string) {
    return this.policyService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get classification policy detail' })
  @ApiResponse({ status: 200, description: 'Policy detail' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.policyService.findOne(tenantId, id);
  }

  @Put(':id')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Update classification policy' })
  @ApiResponse({ status: 200, description: 'Policy updated successfully' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePolicyDto,
  ) {
    return this.policyService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Deactivate classification policy' })
  @ApiResponse({ status: 200, description: 'Policy deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  deactivate(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.policyService.deactivate(tenantId, id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test policy rules against sample data' })
  @ApiResponse({ status: 200, description: 'Test results' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  testPolicy(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TestPolicyDto,
  ) {
    return this.policyService.testPolicy(tenantId, id, dto);
  }
}
