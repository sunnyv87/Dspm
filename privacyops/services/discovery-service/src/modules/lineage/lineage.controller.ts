import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LineageService } from './lineage.service';
import { CreateLineageDto } from './dto/create-lineage.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Asset Lineage')
@ApiBearerAuth('bearer')
@Controller('lineage')
export class LineageController {
  constructor(private readonly lineageService: LineageService) {}

  @Get('asset/:assetId')
  @ApiOperation({ summary: 'Get lineage graph for an asset' })
  @ApiResponse({ status: 200, description: 'Lineage graph retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async getLineageGraph(
    @TenantId() tenantId: string,
    @Param('assetId', ParseUUIDPipe) assetId: string,
  ) {
    return this.lineageService.getLineageGraph(tenantId, assetId);
  }

  @Post()
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Create a lineage relationship between assets' })
  @ApiResponse({ status: 201, description: 'Lineage relationship created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate relationship' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async createLineage(
    @TenantId() tenantId: string,
    @Body() dto: CreateLineageDto,
  ) {
    return this.lineageService.createLineage(tenantId, dto);
  }
}
