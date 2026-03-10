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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FrameworkService } from './framework.service';
import { CreateFrameworkDto } from './dto/create-framework.dto';
import { QueryFrameworkDto } from './dto/query-framework.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Frameworks')
@ApiBearerAuth('bearer')
@Controller('frameworks')
export class FrameworkController {
  constructor(private readonly frameworkService: FrameworkService) {}

  @Post()
  @Permissions('compliance.framework.manage')
  @ApiOperation({ summary: 'Create a new compliance framework' })
  @ApiResponse({ status: 201, description: 'Framework created successfully' })
  @ApiResponse({ status: 409, description: 'Framework already exists' })
  async create(
    @TenantId() tenantId: string,
    @Body() dto: CreateFrameworkDto,
  ) {
    return this.frameworkService.create(tenantId, dto);
  }

  @Get()
  @Permissions('compliance.framework.read')
  @ApiOperation({ summary: 'List compliance frameworks for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of frameworks' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryFrameworkDto,
  ) {
    return this.frameworkService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('compliance.framework.read')
  @ApiOperation({ summary: 'Get a compliance framework by ID' })
  @ApiResponse({ status: 200, description: 'Framework found' })
  @ApiResponse({ status: 404, description: 'Framework not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.frameworkService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('compliance.framework.manage')
  @ApiOperation({ summary: 'Update a compliance framework' })
  @ApiResponse({ status: 200, description: 'Framework updated successfully' })
  @ApiResponse({ status: 404, description: 'Framework not found' })
  @ApiResponse({ status: 409, description: 'Framework name conflict' })
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateFrameworkDto,
  ) {
    return this.frameworkService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions('compliance.framework.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a compliance framework' })
  @ApiResponse({ status: 204, description: 'Framework deleted successfully' })
  @ApiResponse({ status: 404, description: 'Framework not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.frameworkService.delete(tenantId, id);
  }
}
