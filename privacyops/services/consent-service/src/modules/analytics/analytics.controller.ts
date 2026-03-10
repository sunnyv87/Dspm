import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Analytics')
@ApiBearerAuth('bearer')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get overall consent analytics summary' })
  @ApiResponse({ status: 200, description: 'Consent analytics summary' })
  async getSummary(@TenantId() tenantId: string) {
    return this.analyticsService.getSummary(tenantId);
  }

  @Get('by-purpose')
  @ApiOperation({ summary: 'Get consent counts grouped by purpose' })
  @ApiResponse({ status: 200, description: 'Consent counts by purpose' })
  async getByPurpose(@TenantId() tenantId: string) {
    return this.analyticsService.getByPurpose(tenantId);
  }

  @Get('by-channel')
  @ApiOperation({ summary: 'Get consent counts grouped by collection method' })
  @ApiResponse({ status: 200, description: 'Consent counts by collection method' })
  async getByChannel(@TenantId() tenantId: string) {
    return this.analyticsService.getByChannel(tenantId);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get consent grant/withdraw trends over time' })
  @ApiResponse({ status: 200, description: 'Consent trends over time' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to look back (default: 30)' })
  async getTrends(
    @TenantId() tenantId: string,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getTrends(tenantId, days || 30);
  }
}
