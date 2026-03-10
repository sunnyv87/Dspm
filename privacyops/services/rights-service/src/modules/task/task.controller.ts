import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Tasks')
@ApiBearerAuth('bearer')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'List rights tasks for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of tasks' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryTaskDto,
  ) {
    return this.taskService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a rights task by ID' })
  @ApiResponse({ status: 200, description: 'Task found' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.taskService.findById(tenantId, id);
  }

  @Post(':id/complete')
  @Permissions('rights.manage')
  @ApiOperation({ summary: 'Complete a rights task' })
  @ApiResponse({ status: 200, description: 'Task completed successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async complete(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteTaskDto,
  ) {
    return this.taskService.complete(tenantId, id, user.userId, dto);
  }
}
