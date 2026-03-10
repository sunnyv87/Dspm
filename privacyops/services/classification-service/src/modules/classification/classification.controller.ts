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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ClassificationService } from './classification.service';
import { ApplyClassificationDto } from './dto/apply-classification.dto';
import { OverrideClassificationDto } from './dto/override-classification.dto';
import { BulkApplyDto } from './dto/bulk-apply.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Classification')
@ApiBearerAuth('bearer')
@Controller('classifications')
export class ClassificationController {
  constructor(
    private readonly classificationService: ClassificationService,
  ) {}

  @Get('assets')
  @ApiOperation({ summary: 'Get classified assets with their tags (paginated, filterable)' })
  @ApiResponse({ status: 200, description: 'Paginated list of classified assets' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'label', required: false, type: String })
  @ApiQuery({ name: 'regulationTag', required: false, type: String })
  @ApiQuery({ name: 'source', required: false, type: String })
  getClassifiedAssets(
    @TenantId() tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('label') label?: string,
    @Query('regulationTag') regulationTag?: string,
    @Query('source') source?: string,
  ) {
    return this.classificationService.getClassifiedAssets(
      tenantId,
      page,
      limit,
      label,
      regulationTag,
      source,
    );
  }

  @Get('assets/:assetId')
  @ApiOperation({ summary: 'Get all classification tags for an asset' })
  @ApiResponse({ status: 200, description: 'Classification tags for the asset' })
  getAssetTags(
    @TenantId() tenantId: string,
    @Param('assetId', ParseUUIDPipe) assetId: string,
  ) {
    return this.classificationService.getAssetTags(tenantId, assetId);
  }

  @Post('apply/:assetId')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Apply classification to a specific asset' })
  @ApiResponse({ status: 201, description: 'Classification applied successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  applyClassification(
    @TenantId() tenantId: string,
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Body() dto: ApplyClassificationDto,
  ) {
    return this.classificationService.applyClassification(
      assetId,
      tenantId,
      dto.policyId,
      dto.force,
    );
  }

  @Post('override/:assetId')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Manual override of classification' })
  @ApiResponse({ status: 200, description: 'Classification overridden successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  overrideClassification(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Body() dto: OverrideClassificationDto,
  ) {
    return this.classificationService.overrideClassification(
      assetId,
      tenantId,
      userId,
      dto,
    );
  }

  @Post('bulk-apply')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Run classification on multiple assets or by data source' })
  @ApiResponse({ status: 201, description: 'Bulk classification run created' })
  bulkApply(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: BulkApplyDto,
  ) {
    return this.classificationService.bulkApply(tenantId, userId, dto);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all unique tags across tenant' })
  @ApiResponse({ status: 200, description: 'List of unique tags with counts' })
  getUniqueTags(@TenantId() tenantId: string) {
    return this.classificationService.getUniqueTags(tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Classification coverage stats' })
  @ApiResponse({ status: 200, description: 'Classification statistics' })
  getStats(@TenantId() tenantId: string) {
    return this.classificationService.getStats(tenantId);
  }
}
