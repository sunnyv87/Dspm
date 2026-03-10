import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { TriggerSyncDto } from './dto/trigger-sync.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { SyncType } from '../../entities/sync-job.entity';

@ApiTags('Sync Jobs')
@ApiBearerAuth('bearer')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('trigger')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Trigger sync for a data source' })
  @ApiResponse({ status: 201, description: 'Sync job triggered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or sync already running' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Data source not found' })
  async triggerSync(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: TriggerSyncDto,
  ) {
    return this.syncService.triggerSync(tenantId, user.userId, dto);
  }

  @Post('trigger-all')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Trigger sync for all active data sources in tenant' })
  @ApiResponse({ status: 201, description: 'Sync jobs triggered for all active data sources' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async triggerAllSync(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.syncService.triggerAllSync(tenantId, user.userId, SyncType.FULL);
  }

  @Get()
  @ApiOperation({ summary: 'List sync jobs with pagination' })
  @ApiResponse({ status: 200, description: 'Sync jobs retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @TenantId() tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.syncService.findAll(tenantId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sync job detail' })
  @ApiResponse({ status: 200, description: 'Sync job retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Sync job not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.syncService.findById(tenantId, id);
  }

  @Post(':id/cancel')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Cancel a running sync job' })
  @ApiResponse({ status: 200, description: 'Sync job cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Job cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Sync job not found' })
  async cancelSync(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.syncService.cancelSync(tenantId, id);
  }
}
