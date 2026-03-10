import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { QueryRequestDto } from './dto/query-request.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Requests')
@ApiBearerAuth('bearer')
@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  @Permissions('rights.manage')
  @ApiOperation({ summary: 'Create a new rights request' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  async create(
    @TenantId() tenantId: string,
    @Body() dto: CreateRequestDto,
  ) {
    return this.requestService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List rights requests for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of requests' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryRequestDto,
  ) {
    return this.requestService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a rights request by ID' })
  @ApiResponse({ status: 200, description: 'Request found' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.requestService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('rights.manage')
  @ApiOperation({ summary: 'Update a rights request' })
  @ApiResponse({ status: 200, description: 'Request updated successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestDto,
  ) {
    return this.requestService.update(tenantId, id, dto);
  }
}
