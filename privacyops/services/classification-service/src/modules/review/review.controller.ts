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
import { ReviewService } from './review.service';
import { ReviewActionDto, ReviewOverrideDto } from './dto/review-action.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Classification Reviews')
@ApiBearerAuth('bearer')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @ApiOperation({ summary: 'Get review queue (filter by status)' })
  @ApiResponse({ status: 200, description: 'Paginated review queue' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.reviewService.findAll(tenantId, status, page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Review queue stats' })
  @ApiResponse({ status: 200, description: 'Review queue statistics' })
  getStats(@TenantId() tenantId: string) {
    return this.reviewService.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review item detail' })
  @ApiResponse({ status: 200, description: 'Review item detail' })
  @ApiResponse({ status: 404, description: 'Review item not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reviewService.findOne(tenantId, id);
  }

  @Post(':id/approve')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Approve suggested classification' })
  @ApiResponse({ status: 200, description: 'Review item approved' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Review item not found' })
  approve(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewActionDto,
  ) {
    return this.reviewService.approve(tenantId, id, userId, dto.reviewNotes);
  }

  @Post(':id/reject')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Reject and keep original classification' })
  @ApiResponse({ status: 200, description: 'Review item rejected' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Review item not found' })
  reject(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewActionDto,
  ) {
    return this.reviewService.reject(tenantId, id, userId, dto.reviewNotes);
  }

  @Post(':id/override')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Override with different label' })
  @ApiResponse({ status: 200, description: 'Review item overridden' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Review item not found' })
  override(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewOverrideDto,
  ) {
    return this.reviewService.override(tenantId, id, userId, dto);
  }
}
