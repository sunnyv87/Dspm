import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { QueryDataSourceDto } from './dto/query-data-source.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Data Sources')
@ApiBearerAuth('bearer')
@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Register a new data source' })
  @ApiResponse({ status: 201, description: 'Data source created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateDataSourceDto,
  ) {
    return this.dataSourceService.create(tenantId, user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List data sources with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Data sources retrieved successfully' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryDataSourceDto,
  ) {
    return this.dataSourceService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get data source details with stats' })
  @ApiResponse({ status: 200, description: 'Data source retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Data source not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dataSourceService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Update a data source' })
  @ApiResponse({ status: 200, description: 'Data source updated successfully' })
  @ApiResponse({ status: 404, description: 'Data source not found' })
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDataSourceDto,
  ) {
    return this.dataSourceService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Deactivate a data source' })
  @ApiResponse({ status: 200, description: 'Data source deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Data source not found' })
  async deactivate(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dataSourceService.deactivate(tenantId, id);
  }

  @Post(':id/health-check')
  @Permissions('data_assets.manage')
  @ApiOperation({ summary: 'Trigger a health check for a data source' })
  @ApiResponse({ status: 200, description: 'Health check completed' })
  @ApiResponse({ status: 404, description: 'Data source not found' })
  async healthCheck(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dataSourceService.triggerHealthCheck(tenantId, id);
  }
}
