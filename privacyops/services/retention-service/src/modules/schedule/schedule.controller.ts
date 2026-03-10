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
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Schedules')
@ApiBearerAuth('bearer')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @Permissions('retention.manage')
  @ApiOperation({ summary: 'Create a new retention schedule' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully' })
  async create(
    @TenantId() tenantId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.scheduleService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List retention schedules for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of schedules' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryScheduleDto,
  ) {
    return this.scheduleService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a retention schedule by ID' })
  @ApiResponse({ status: 200, description: 'Schedule found' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.scheduleService.findById(tenantId, id);
  }

  @Patch(':id/status')
  @Permissions('retention.manage')
  @ApiOperation({ summary: 'Update retention schedule status' })
  @ApiResponse({ status: 200, description: 'Schedule status updated' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async updateStatus(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.scheduleService.updateStatus(tenantId, id, status);
  }

  @Delete(':id')
  @Permissions('retention.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a retention schedule' })
  @ApiResponse({ status: 204, description: 'Schedule deleted' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.scheduleService.delete(tenantId, id);
  }
}
