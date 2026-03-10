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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RemediationService } from './remediation.service';
import { GenerateRemediationDto, UpdateRemediationStatusDto } from './dto/generate-remediation.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RemediationPriority, RemediationStatus } from '../../entities/remediation-suggestion.entity';

@ApiTags('Remediations')
@ApiBearerAuth('bearer')
@Controller('remediations')
export class RemediationController {
  constructor(private readonly remediationService: RemediationService) {}

  @Post()
  @Permissions('compliance.remediation.manage')
  @ApiOperation({ summary: 'Generate a remediation suggestion for a finding' })
  @ApiResponse({ status: 201, description: 'Remediation generated successfully' })
  @ApiResponse({ status: 404, description: 'Finding or scan not found' })
  async generate(
    @TenantId() tenantId: string,
    @Body() dto: GenerateRemediationDto,
  ) {
    return this.remediationService.generate(tenantId, dto);
  }

  @Post('scan/:scanId')
  @Permissions('compliance.remediation.manage')
  @ApiOperation({ summary: 'Generate remediations for all failed findings in a scan' })
  @ApiResponse({ status: 201, description: 'Remediations generated for scan' })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  async generateForScan(
    @TenantId() tenantId: string,
    @Param('scanId', ParseUUIDPipe) scanId: string,
  ) {
    return this.remediationService.generateForScan(tenantId, scanId);
  }

  @Get()
  @Permissions('compliance.remediation.read')
  @ApiOperation({ summary: 'List remediation suggestions for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of remediations' })
  @ApiQuery({ name: 'scanId', required: false })
  @ApiQuery({ name: 'findingId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: RemediationStatus })
  @ApiQuery({ name: 'priority', required: false, enum: RemediationPriority })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @TenantId() tenantId: string,
    @Query('scanId') scanId?: string,
    @Query('findingId') findingId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.remediationService.findAll(tenantId, {
      scanId,
      findingId,
      status,
      priority,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @Permissions('compliance.remediation.read')
  @ApiOperation({ summary: 'Get a remediation suggestion by ID' })
  @ApiResponse({ status: 200, description: 'Remediation found' })
  @ApiResponse({ status: 404, description: 'Remediation not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.remediationService.findById(tenantId, id);
  }

  @Put(':id/status')
  @Permissions('compliance.remediation.manage')
  @ApiOperation({ summary: 'Update remediation status' })
  @ApiResponse({ status: 200, description: 'Remediation status updated' })
  @ApiResponse({ status: 404, description: 'Remediation not found' })
  async updateStatus(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRemediationStatusDto,
  ) {
    return this.remediationService.updateStatus(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions('compliance.remediation.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a remediation suggestion' })
  @ApiResponse({ status: 204, description: 'Remediation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Remediation not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.remediationService.delete(tenantId, id);
  }
}
