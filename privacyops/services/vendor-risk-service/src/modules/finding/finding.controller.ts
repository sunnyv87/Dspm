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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FindingService } from './finding.service';
import { CreateFindingDto } from './dto/create-finding.dto';
import { QueryFindingDto } from './dto/query-finding.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { FindingStatus } from '../../entities/risk-finding.entity';

@ApiTags('Findings')
@ApiBearerAuth('bearer')
@Controller('findings')
export class FindingController {
  constructor(private readonly findingService: FindingService) {}

  @Post()
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Create a new risk finding' })
  @ApiResponse({ status: 201, description: 'Finding created successfully' })
  @ApiResponse({ status: 404, description: 'Vendor or assessment not found' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateFindingDto,
  ) {
    return this.findingService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List risk findings for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of findings' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryFindingDto,
  ) {
    return this.findingService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a finding by ID' })
  @ApiResponse({ status: 200, description: 'Finding found' })
  @ApiResponse({ status: 404, description: 'Finding not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.findingService.findById(tenantId, id);
  }

  @Put(':id/status')
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Update finding status' })
  @ApiResponse({ status: 200, description: 'Finding status updated' })
  @ApiResponse({ status: 404, description: 'Finding not found' })
  async updateStatus(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: FindingStatus; remediationPlan?: string },
  ) {
    return this.findingService.updateStatus(tenantId, id, body.status, body.remediationPlan);
  }

  @Delete(':id')
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Delete a finding' })
  @ApiResponse({ status: 200, description: 'Finding deleted' })
  @ApiResponse({ status: 404, description: 'Finding not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.findingService.delete(tenantId, id);
    return { deleted: true };
  }
}
