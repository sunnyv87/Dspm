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
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Schedules')
@ApiBearerAuth('bearer')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @Permissions('reports.manage')
  @ApiOperation({ summary: 'Create a new scheduled report' })
  @ApiResponse({ status: 201, description: 'Scheduled report created successfully' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.scheduleService.create(tenantId, user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List scheduled reports for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of scheduled reports' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryScheduleDto,
  ) {
    return this.scheduleService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scheduled report by ID' })
  @ApiResponse({ status: 200, description: 'Scheduled report found' })
  @ApiResponse({ status: 404, description: 'Scheduled report not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.scheduleService.findById(tenantId, id);
  }

  @Delete(':id')
  @Permissions('reports.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a scheduled report' })
  @ApiResponse({ status: 204, description: 'Scheduled report deleted' })
  @ApiResponse({ status: 404, description: 'Scheduled report not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.scheduleService.delete(tenantId, id);
  }
}
