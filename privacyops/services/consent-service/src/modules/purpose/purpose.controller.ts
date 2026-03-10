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
import { PurposeService } from './purpose.service';
import { CreatePurposeDto } from './dto/create-purpose.dto';
import { UpdatePurposeDto } from './dto/update-purpose.dto';
import { QueryPurposeDto } from './dto/query-purpose.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Purposes')
@ApiBearerAuth('bearer')
@Controller('purposes')
export class PurposeController {
  constructor(private readonly purposeService: PurposeService) {}

  @Post()
  @Permissions('consent.manage')
  @ApiOperation({ summary: 'Create a new consent purpose' })
  @ApiResponse({ status: 201, description: 'Purpose created successfully' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreatePurposeDto,
  ) {
    return this.purposeService.create(tenantId, user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List consent purposes for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of purposes' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryPurposeDto,
  ) {
    return this.purposeService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a consent purpose by ID' })
  @ApiResponse({ status: 200, description: 'Purpose found' })
  @ApiResponse({ status: 404, description: 'Purpose not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.purposeService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('consent.manage')
  @ApiOperation({ summary: 'Update a consent purpose' })
  @ApiResponse({ status: 200, description: 'Purpose updated successfully' })
  @ApiResponse({ status: 404, description: 'Purpose not found' })
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePurposeDto,
  ) {
    return this.purposeService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions('consent.manage')
  @ApiOperation({ summary: 'Deactivate a consent purpose (soft delete)' })
  @ApiResponse({ status: 200, description: 'Purpose deactivated' })
  @ApiResponse({ status: 404, description: 'Purpose not found' })
  async deactivate(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.purposeService.deactivate(tenantId, id);
  }

  @Post(':id/new-version')
  @Permissions('consent.manage')
  @ApiOperation({ summary: 'Create a new version of a consent purpose' })
  @ApiResponse({ status: 201, description: 'New version created' })
  @ApiResponse({ status: 404, description: 'Original purpose not found' })
  async createNewVersion(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePurposeDto,
  ) {
    return this.purposeService.createNewVersion(tenantId, id, user.userId, dto);
  }
}
