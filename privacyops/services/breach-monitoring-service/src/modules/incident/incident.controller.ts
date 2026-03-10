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
import { IncidentService } from './incident.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { QueryIncidentDto } from './dto/query-incident.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Incidents')
@ApiBearerAuth('bearer')
@Controller('incidents')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post()
  @Permissions('breach.manage')
  @ApiOperation({ summary: 'Create a new breach incident' })
  @ApiResponse({ status: 201, description: 'Incident created successfully' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.incidentService.create(tenantId, user.userId, dto);
  }

  @Get()
  @Permissions('breach.read')
  @ApiOperation({ summary: 'List breach incidents for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of incidents' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryIncidentDto,
  ) {
    return this.incidentService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('breach.read')
  @ApiOperation({ summary: 'Get a breach incident by ID' })
  @ApiResponse({ status: 200, description: 'Incident found' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.incidentService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('breach.manage')
  @ApiOperation({ summary: 'Update a breach incident' })
  @ApiResponse({ status: 200, description: 'Incident updated successfully' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  async update(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.incidentService.update(tenantId, id, user.userId, dto);
  }

  @Delete(':id')
  @Permissions('breach.manage')
  @ApiOperation({ summary: 'Delete a breach incident' })
  @ApiResponse({ status: 200, description: 'Incident deleted successfully' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  async delete(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.incidentService.delete(tenantId, id, user.userId);
    return { message: 'Incident deleted successfully' };
  }
}
