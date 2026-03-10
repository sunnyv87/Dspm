import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { ComplianceDashboardService } from './compliance-dashboard.service';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { TenantContextInterceptor } from '../../common/interceptors/tenant-context.interceptor';

@ApiTags('compliance')
@ApiBearerAuth()
@UseInterceptors(TenantContextInterceptor, AuditInterceptor)
@Controller('compliance')
export class ComplianceDashboardController {
  constructor(
    private readonly complianceDashboardService: ComplianceDashboardService,
  ) {}

  @Get('summary')
  @Permissions('dashboard:read', 'compliance:read')
  @ApiOperation({ summary: 'Get compliance overview with framework scores and gaps' })
  @ApiOkResponse({ description: 'Compliance dashboard summary' })
  async getSummary(@Req() request: Request) {
    const token = this.extractToken(request);
    return this.complianceDashboardService.getSummary(token);
  }

  @Get('frameworks')
  @Permissions('dashboard:read', 'compliance:read')
  @ApiOperation({ summary: 'Get per-framework compliance status' })
  @ApiOkResponse({ description: 'Compliance status for each regulatory framework' })
  async getFrameworks(@Req() request: Request) {
    const token = this.extractToken(request);
    return this.complianceDashboardService.getFrameworks(token);
  }

  @Get('trends')
  @Permissions('dashboard:read', 'compliance:read')
  @ApiOperation({ summary: 'Get compliance trend over time' })
  @ApiOkResponse({ description: 'Compliance score trends over time' })
  async getTrends(@Req() request: Request) {
    const token = this.extractToken(request);
    return this.complianceDashboardService.getTrends(token);
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return undefined;
  }
}
