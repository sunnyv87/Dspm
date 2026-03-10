import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { QueryAssetDto } from './dto/query-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Data Assets')
@ApiBearerAuth('bearer')
@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get asset inventory statistics' })
  @ApiResponse({ status: 200, description: 'Asset stats retrieved successfully' })
  async getStats(@TenantId() tenantId: string) {
    return this.assetService.getStats(tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List data assets with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryAssetDto,
  ) {
    return this.assetService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset detail' })
  @ApiResponse({ status: 200, description: 'Asset retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assetService.findById(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update asset metadata (owner, business owner, tags)' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetService.update(tenantId, id, dto);
  }

  @Get(':id/lineage')
  @ApiOperation({ summary: 'Get asset lineage (upstream and downstream)' })
  @ApiResponse({ status: 200, description: 'Asset lineage retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async getLineage(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assetService.getLineage(tenantId, id);
  }
}
