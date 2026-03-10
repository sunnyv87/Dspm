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
import { RunService } from './run.service';
import { TriggerRunDto } from './dto/trigger-run.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Classification Runs')
@ApiBearerAuth('bearer')
@Controller('runs')
export class RunController {
  constructor(private readonly runService: RunService) {}

  @Post()
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Trigger a classification run' })
  @ApiResponse({ status: 201, description: 'Classification run created' })
  triggerRun(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: TriggerRunDto,
  ) {
    return this.runService.triggerRun(tenantId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List classification runs' })
  @ApiResponse({ status: 200, description: 'Paginated list of classification runs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @TenantId() tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.runService.findAll(tenantId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get classification run detail with progress' })
  @ApiResponse({ status: 200, description: 'Classification run detail' })
  @ApiResponse({ status: 404, description: 'Run not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.runService.findOne(tenantId, id);
  }

  @Post(':id/cancel')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Cancel a running classification' })
  @ApiResponse({ status: 200, description: 'Classification run cancelled' })
  @ApiResponse({ status: 400, description: 'Cannot cancel run in current state' })
  @ApiResponse({ status: 404, description: 'Run not found' })
  cancelRun(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.runService.cancelRun(tenantId, id);
  }
}
