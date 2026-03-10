import {
  Controller,
  Get,
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
import { FindingService } from './finding.service';
import { QueryFindingDto } from './dto/query-finding.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Findings')
@ApiBearerAuth('bearer')
@Controller('findings')
export class FindingController {
  constructor(private readonly findingService: FindingService) {}

  @Get()
  @Permissions('compliance.finding.read')
  @ApiOperation({ summary: 'List compliance findings for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of findings' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryFindingDto,
  ) {
    return this.findingService.findAll(tenantId, query);
  }

  @Get('stats/:scanId')
  @Permissions('compliance.finding.read')
  @ApiOperation({ summary: 'Get finding statistics for a scan' })
  @ApiResponse({ status: 200, description: 'Finding statistics' })
  async getStatsByScan(
    @TenantId() tenantId: string,
    @Param('scanId', ParseUUIDPipe) scanId: string,
  ) {
    return this.findingService.getStatsByScan(tenantId, scanId);
  }

  @Get(':id')
  @Permissions('compliance.finding.read')
  @ApiOperation({ summary: 'Get a compliance finding by ID' })
  @ApiResponse({ status: 200, description: 'Finding found' })
  @ApiResponse({ status: 404, description: 'Finding not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.findingService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('compliance.finding.manage')
  @ApiOperation({ summary: 'Update a compliance finding' })
  @ApiResponse({ status: 200, description: 'Finding updated successfully' })
  @ApiResponse({ status: 404, description: 'Finding not found' })
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFindingDto,
  ) {
    return this.findingService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions('compliance.finding.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a compliance finding' })
  @ApiResponse({ status: 204, description: 'Finding deleted successfully' })
  @ApiResponse({ status: 404, description: 'Finding not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.findingService.delete(tenantId, id);
  }
}
