import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
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
  @Permissions('retention.manage')
  @ApiOperation({ summary: 'Create a new retention policy' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreatePolicyDto,
  ) {
    return this.policyService.create(tenantId, user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List retention policies for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of policies' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryPolicyDto,
  ) {
    return this.policyService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a retention policy by ID' })
  @ApiResponse({ status: 200, description: 'Policy found' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.policyService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('retention.manage')
  @ApiOperation({ summary: 'Update a retention policy' })
  @ApiResponse({ status: 200, description: 'Policy updated successfully' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePolicyDto,
  ) {
    return this.policyService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions('retention.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a retention policy' })
  @ApiResponse({ status: 204, description: 'Policy deleted' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.policyService.delete(tenantId, id);
  }
}
