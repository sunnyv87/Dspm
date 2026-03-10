import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import { AddTimelineEntryDto } from './dto/add-timeline-entry.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Timeline')
@ApiBearerAuth('bearer')
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post()
  @Permissions('breach.manage')
  @ApiOperation({ summary: 'Add a timeline entry to a breach incident' })
  @ApiResponse({ status: 201, description: 'Timeline entry added successfully' })
  async addEntry(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: AddTimelineEntryDto,
  ) {
    return this.timelineService.addEntry(tenantId, user.userId, dto);
  }

  @Get()
  @Permissions('breach.read')
  @ApiOperation({ summary: 'Get timeline entries for a breach incident' })
  @ApiResponse({ status: 200, description: 'List of timeline entries' })
  @ApiQuery({ name: 'incidentId', type: String, description: 'Incident UUID' })
  async findByIncident(
    @TenantId() tenantId: string,
    @Query('incidentId', ParseUUIDPipe) incidentId: string,
  ) {
    return this.timelineService.findByIncident(tenantId, incidentId);
  }

  @Get(':id')
  @Permissions('breach.read')
  @ApiOperation({ summary: 'Get a timeline entry by ID' })
  @ApiResponse({ status: 200, description: 'Timeline entry found' })
  @ApiResponse({ status: 404, description: 'Timeline entry not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.timelineService.findById(tenantId, id);
  }

  @Delete(':id')
  @Permissions('breach.manage')
  @ApiOperation({ summary: 'Delete a timeline entry' })
  @ApiResponse({ status: 200, description: 'Timeline entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Timeline entry not found' })
  async delete(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.timelineService.delete(tenantId, id, user.userId);
    return { message: 'Timeline entry deleted successfully' };
  }
}
