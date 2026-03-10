import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExecutionService } from './execution.service';
import { QueryExecutionDto } from './dto/query-execution.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Executions')
@ApiBearerAuth('bearer')
@Controller('executions')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Get()
  @ApiOperation({ summary: 'List report executions for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of report executions' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryExecutionDto,
  ) {
    return this.executionService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report execution by ID' })
  @ApiResponse({ status: 200, description: 'Report execution found' })
  @ApiResponse({ status: 404, description: 'Report execution not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.executionService.findById(tenantId, id);
  }
}
