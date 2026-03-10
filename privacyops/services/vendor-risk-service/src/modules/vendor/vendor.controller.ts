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
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { QueryVendorDto } from './dto/query-vendor.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Vendors')
@ApiBearerAuth('bearer')
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Register a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  @ApiResponse({ status: 409, description: 'Vendor with this name already exists' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateVendorDto,
  ) {
    return this.vendorService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List vendors for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of vendors' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryVendorDto,
  ) {
    return this.vendorService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vendor by ID' })
  @ApiResponse({ status: 200, description: 'Vendor found' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vendorService.findById(tenantId, id);
  }

  @Put(':id')
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVendorDto,
  ) {
    return this.vendorService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Offboard a vendor (soft delete)' })
  @ApiResponse({ status: 200, description: 'Vendor offboarded' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vendorService.delete(tenantId, id);
  }
}
