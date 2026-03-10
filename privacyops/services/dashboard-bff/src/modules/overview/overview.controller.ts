import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { OverviewService } from './overview.service';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { TenantContextInterceptor } from '../../common/interceptors/tenant-context.interceptor';

@ApiTags('overview')
@ApiBearerAuth()
@UseInterceptors(TenantContextInterceptor, AuditInterceptor)
@Controller('overview')
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get('summary')
  @Permissions('dashboard:read')
  @ApiOperation({ summary: 'Get aggregated dashboard summary across all services' })
  @ApiOkResponse({ description: 'Dashboard summary with totals for assets, risks, compliance, breaches, and requests' })
  async getSummary(@Req() request: Request) {
    const token = this.extractToken(request);
    return this.overviewService.getSummary(token);
  }

  @Get('metrics')
  @Permissions('dashboard:read')
  @ApiOperation({ summary: 'Get key metrics with time-series data' })
  @ApiOkResponse({ description: 'Key metrics including trends and time-series data' })
  async getMetrics(@Req() request: Request) {
    const token = this.extractToken(request);
    return this.overviewService.getMetrics(token);
  }

  @Get('alerts')
  @Permissions('dashboard:read')
  @ApiOperation({ summary: 'Get critical alerts across all services' })
  @ApiOkResponse({ description: 'List of critical alerts aggregated from all services' })
  async getAlerts(@Req() request: Request) {
    const token = this.extractToken(request);
    return this.overviewService.getAlerts(token);
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return undefined;
  }
}
