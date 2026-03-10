import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ScanService } from './scan.service';
import { TriggerScanDto } from './dto/trigger-scan.dto';
import { QueryScanDto } from './dto/query-scan.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Scans')
@ApiBearerAuth('bearer')
@Controller('scans')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @Permissions('compliance.scan.trigger')
  @ApiOperation({ summary: 'Trigger a new compliance scan' })
  @ApiResponse({ status: 201, description: 'Scan triggered successfully' })
  @ApiResponse({ status: 404, description: 'Framework not found' })
  @ApiResponse({ status: 400, description: 'Framework not active' })
  async trigger(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: TriggerScanDto,
  ) {
    return this.scanService.trigger(tenantId, user.userId, dto);
  }

  @Get()
  @Permissions('compliance.scan.read')
  @ApiOperation({ summary: 'List compliance scans for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of scans' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryScanDto,
  ) {
    return this.scanService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('compliance.scan.read')
  @ApiOperation({ summary: 'Get a compliance scan by ID' })
  @ApiResponse({ status: 200, description: 'Scan found' })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.scanService.findById(tenantId, id);
  }

  @Post(':id/cancel')
  @Permissions('compliance.scan.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a running compliance scan' })
  @ApiResponse({ status: 200, description: 'Scan cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  @ApiResponse({ status: 400, description: 'Scan cannot be cancelled' })
  async cancel(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.scanService.cancel(tenantId, id);
  }

  @Delete(':id')
  @Permissions('compliance.scan.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a compliance scan' })
  @ApiResponse({ status: 204, description: 'Scan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.scanService.delete(tenantId, id);
  }
}
