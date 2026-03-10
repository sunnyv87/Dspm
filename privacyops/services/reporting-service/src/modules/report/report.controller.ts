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
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { GenerateReportDto } from './dto/generate-report.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Reports')
@ApiBearerAuth('bearer')
@Controller('definitions')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @Permissions('reports.manage')
  @ApiOperation({ summary: 'Create a new report definition' })
  @ApiResponse({ status: 201, description: 'Report definition created successfully' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportService.create(tenantId, user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List report definitions for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of report definitions' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryReportDto,
  ) {
    return this.reportService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report definition by ID' })
  @ApiResponse({ status: 200, description: 'Report definition found' })
  @ApiResponse({ status: 404, description: 'Report definition not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reportService.findById(tenantId, id);
  }

  @Post(':id/generate')
  @Permissions('reports.generate')
  @ApiOperation({ summary: 'Generate a report from a definition' })
  @ApiResponse({ status: 201, description: 'Report generation triggered' })
  @ApiResponse({ status: 404, description: 'Report definition not found' })
  async generate(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GenerateReportDto,
  ) {
    return this.reportService.generate(tenantId, id, user.userId, dto);
  }

  @Delete(':id')
  @Permissions('reports.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a report definition' })
  @ApiResponse({ status: 204, description: 'Report definition deleted' })
  @ApiResponse({ status: 404, description: 'Report definition not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reportService.delete(tenantId, id);
  }
}
