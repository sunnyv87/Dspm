import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { SyncService } from './sync.service';

@ApiTags('DSPM Sync')
@Controller('sync')
export class SyncController {
  constructor(private service: SyncService) {}

  @Post('full')
  fullSync(@Body() body: { tenantId: string }) { return this.service.fullSync(body.tenantId); }

  @Post('assets')
  syncAssets(@Body() body: { tenantId: string }) { return this.service.syncAssets(body.tenantId); }

  @Post('classifications')
  syncClassifications(@Body() body: { tenantId: string }) { return this.service.syncClassifications(body.tenantId); }

  @Post('risk-scores')
  syncRiskScores(@Body() body: { tenantId: string }) { return this.service.syncRiskScores(body.tenantId); }

  @Post('trigger-scan')
  triggerScan(@Body() body: { tenantId: string; connectorId: string; scanType?: string }) {
    return this.service.triggerScan(body.tenantId, body.connectorId, body.scanType);
  }

  @Get('history')
  @ApiQuery({ name: 'resourceType', required: false })
  getHistory(@Query('tenantId') tenantId: string, @Query('resourceType') resourceType?: string) {
    return this.service.getSyncHistory(tenantId, resourceType);
  }
}
