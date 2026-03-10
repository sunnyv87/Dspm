import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
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
  @ApiOperation({ summary: 'List workflow tasks for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of workflow tasks' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryTaskDto,
  ) {
    return this.taskService.findAll(tenantId, query);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'List tasks assigned to the current user' })
  @ApiResponse({ status: 200, description: 'Paginated list of assigned tasks' })
  async getMyTasks(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Query() query: QueryTaskDto,
  ) {
    return this.taskService.getMyTasks(tenantId, user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workflow task by ID' })
  @ApiResponse({ status: 200, description: 'Workflow task found' })
  @ApiResponse({ status: 404, description: 'Workflow task not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.taskService.findById(tenantId, id);
  }

  @Post(':id/assign')
  @Permissions('workflow.manage')
  @ApiOperation({ summary: 'Assign a workflow task to a user or group' })
  @ApiResponse({ status: 200, description: 'Task assigned successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Task cannot be assigned' })
  async assign(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTaskDto,
  ) {
    return this.taskService.assign(tenantId, id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a workflow task' })
  @ApiResponse({ status: 200, description: 'Task completed successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Task cannot be completed' })
  async complete(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteTaskDto,
  ) {
    return this.taskService.complete(tenantId, id, user.userId, dto);
  }

  @Post(':id/skip')
  @Permissions('workflow.manage')
  @ApiOperation({ summary: 'Skip a workflow task' })
  @ApiResponse({ status: 200, description: 'Task skipped successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Task cannot be skipped' })
  async skip(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.taskService.skip(tenantId, id, user.userId);
  }
}
