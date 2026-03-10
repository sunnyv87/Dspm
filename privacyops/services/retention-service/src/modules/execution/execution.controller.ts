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
import { ExecutionService } from './execution.service';
import { TriggerExecutionDto } from './dto/trigger-execution.dto';
import { QueryExecutionDto } from './dto/query-execution.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Executions')
@ApiBearerAuth('bearer')
@Controller('executions')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post()
  @Permissions('retention.execute')
  @ApiOperation({ summary: 'Trigger a retention execution' })
  @ApiResponse({ status: 201, description: 'Execution triggered successfully' })
  async trigger(
    @TenantId() tenantId: string,
    @Body() dto: TriggerExecutionDto,
  ) {
    return this.executionService.trigger(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List retention executions for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of executions' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryExecutionDto,
  ) {
    return this.executionService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a retention execution by ID' })
  @ApiResponse({ status: 200, description: 'Execution found' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.executionService.findById(tenantId, id);
  }
}
