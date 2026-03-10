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
import { DefinitionService } from './definition.service';
import { CreateDefinitionDto } from './dto/create-definition.dto';
import { UpdateDefinitionDto } from './dto/update-definition.dto';
import { QueryDefinitionDto } from './dto/query-definition.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Definitions')
@ApiBearerAuth('bearer')
@Controller('definitions')
export class DefinitionController {
  constructor(private readonly definitionService: DefinitionService) {}

  @Post()
  @Permissions('workflow.manage')
  @ApiOperation({ summary: 'Create a new workflow definition' })
  @ApiResponse({ status: 201, description: 'Workflow definition created successfully' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateDefinitionDto,
  ) {
    return this.definitionService.create(tenantId, user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List workflow definitions for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of workflow definitions' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryDefinitionDto,
  ) {
    return this.definitionService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workflow definition by ID' })
  @ApiResponse({ status: 200, description: 'Workflow definition found' })
  @ApiResponse({ status: 404, description: 'Workflow definition not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.definitionService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('workflow.manage')
  @ApiOperation({ summary: 'Update a workflow definition' })
  @ApiResponse({ status: 200, description: 'Workflow definition updated successfully' })
  @ApiResponse({ status: 404, description: 'Workflow definition not found' })
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDefinitionDto,
  ) {
    return this.definitionService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions('workflow.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive a workflow definition (soft delete)' })
  @ApiResponse({ status: 204, description: 'Workflow definition archived' })
  @ApiResponse({ status: 404, description: 'Workflow definition not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.definitionService.delete(tenantId, id);
  }

  @Post(':id/versions')
  @Permissions('workflow.manage')
  @ApiOperation({ summary: 'Create a new version of a workflow definition' })
  @ApiResponse({ status: 201, description: 'New version created' })
  @ApiResponse({ status: 404, description: 'Original definition not found' })
  async createNewVersion(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateDefinitionDto,
  ) {
    return this.definitionService.createNewVersion(tenantId, id, user.userId, dto);
  }
}
