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
import { InstanceService } from './instance.service';
import { StartInstanceDto } from './dto/start-instance.dto';
import { QueryInstanceDto } from './dto/query-instance.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Instances')
@ApiBearerAuth('bearer')
@Controller('instances')
export class InstanceController {
  constructor(private readonly instanceService: InstanceService) {}

  @Post()
  @Permissions('workflow.execute')
  @ApiOperation({ summary: 'Start a new workflow instance' })
  @ApiResponse({ status: 201, description: 'Workflow instance started successfully' })
  @ApiResponse({ status: 404, description: 'Workflow definition not found' })
  @ApiResponse({ status: 400, description: 'Definition not active' })
  async start(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: StartInstanceDto,
  ) {
    return this.instanceService.start(tenantId, user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List workflow instances for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of workflow instances' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryInstanceDto,
  ) {
    return this.instanceService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workflow instance by ID' })
  @ApiResponse({ status: 200, description: 'Workflow instance found' })
  @ApiResponse({ status: 404, description: 'Workflow instance not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.instanceService.findById(tenantId, id);
  }

  @Post(':id/cancel')
  @Permissions('workflow.manage')
  @ApiOperation({ summary: 'Cancel a workflow instance' })
  @ApiResponse({ status: 200, description: 'Workflow instance cancelled' })
  @ApiResponse({ status: 404, description: 'Workflow instance not found' })
  @ApiResponse({ status: 400, description: 'Instance cannot be cancelled' })
  async cancel(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.instanceService.cancel(tenantId, id, user.userId);
  }

  @Post(':id/pause')
  @Permissions('workflow.manage')
  @ApiOperation({ summary: 'Pause a running workflow instance' })
  @ApiResponse({ status: 200, description: 'Workflow instance paused' })
  @ApiResponse({ status: 404, description: 'Workflow instance not found' })
  @ApiResponse({ status: 400, description: 'Instance cannot be paused' })
  async pause(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.instanceService.pause(tenantId, id);
  }

  @Post(':id/resume')
  @Permissions('workflow.manage')
  @ApiOperation({ summary: 'Resume a paused workflow instance' })
  @ApiResponse({ status: 200, description: 'Workflow instance resumed' })
  @ApiResponse({ status: 404, description: 'Workflow instance not found' })
  @ApiResponse({ status: 400, description: 'Instance cannot be resumed' })
  async resume(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.instanceService.resume(tenantId, id);
  }
}
