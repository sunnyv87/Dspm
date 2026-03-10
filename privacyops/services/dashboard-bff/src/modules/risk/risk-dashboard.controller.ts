import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { RiskDashboardService } from './risk-dashboard.service';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { TenantContextInterceptor } from '../../common/interceptors/tenant-context.interceptor';

@ApiTags('risk')
@ApiBearerAuth()
@UseInterceptors(TenantContextInterceptor, AuditInterceptor)
@Controller('risk')
export class RiskDashboardController {
  constructor(private readonly riskDashboardService: RiskDashboardService) {}

  @Get('summary')
  @Permissions('dashboard:read', 'risk:read')
  @ApiOperation({ summary: 'Get risk overview with distribution, top risks, and trend' })
  @ApiOkResponse({ description: 'Risk dashboard summary' })
  async getSummary(@Req() request: Request) {
    const token = this.extractToken(request);
    return this.riskDashboardService.getSummary(token);
  }

  @Get('heatmap')
  @Permissions('dashboard:read', 'risk:read')
  @ApiOperation({ summary: 'Get risk heatmap data' })
  @ApiOkResponse({ description: 'Risk heatmap with likelihood vs impact matrix' })
  async getHeatmap(@Req() request: Request) {
    const token = this.extractToken(request);
    return this.riskDashboardService.getHeatmap(token);
  }

  @Get('vendors')
  @Permissions('dashboard:read', 'risk:read')
  @ApiOperation({ summary: 'Get vendor risk summary' })
  @ApiOkResponse({ description: 'Vendor risk summary with distribution and top vendors' })
  async getVendors(@Req() request: Request) {
    const token = this.extractToken(request);
    return this.riskDashboardService.getVendors(token);
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return undefined;
  }
}
