import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { QueryPolicyDto } from './dto/query-policy.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Policies')
@ApiBearerAuth('bearer')
@Controller('policies')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post()
  @Permissions('consent.manage')
  @ApiOperation({ summary: 'Create a new policy version' })
  @ApiResponse({ status: 201, description: 'Policy version created' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreatePolicyDto,
  ) {
    return this.policyService.create(tenantId, user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List policy versions for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of policy versions' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryPolicyDto,
  ) {
    return this.policyService.findAll(tenantId, query);
  }

  @Get('active/:purposeId')
  @ApiOperation({ summary: 'Get the active policy for a purpose' })
  @ApiResponse({ status: 200, description: 'Active policy found' })
  @ApiResponse({ status: 404, description: 'No active policy found' })
  async findActiveByPurpose(
    @TenantId() tenantId: string,
    @Param('purposeId', ParseUUIDPipe) purposeId: string,
  ) {
    return this.policyService.findActiveByPurpose(tenantId, purposeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a policy version by ID' })
  @ApiResponse({ status: 200, description: 'Policy version found' })
  @ApiResponse({ status: 404, description: 'Policy version not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.policyService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('consent.manage')
  @ApiOperation({ summary: 'Update a policy version' })
  @ApiResponse({ status: 200, description: 'Policy version updated' })
  @ApiResponse({ status: 404, description: 'Policy version not found' })
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreatePolicyDto>,
  ) {
    return this.policyService.update(tenantId, id, dto);
  }
}
