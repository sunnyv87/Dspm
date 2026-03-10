import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AffectedService } from './affected.service';
import { RegisterAffectedDto } from './dto/register-affected.dto';
import { QueryAffectedDto } from './dto/query-affected.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Affected Subjects')
@ApiBearerAuth('bearer')
@Controller('affected-subjects')
export class AffectedController {
  constructor(private readonly affectedService: AffectedService) {}

  @Post()
  @Permissions('breach.manage')
  @ApiOperation({ summary: 'Register an affected data subject' })
  @ApiResponse({ status: 201, description: 'Affected subject registered successfully' })
  async register(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: RegisterAffectedDto,
  ) {
    return this.affectedService.register(tenantId, user.userId, dto);
  }

  @Get()
  @Permissions('breach.read')
  @ApiOperation({ summary: 'List affected data subjects for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of affected data subjects' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryAffectedDto,
  ) {
    return this.affectedService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('breach.read')
  @ApiOperation({ summary: 'Get an affected data subject by ID' })
  @ApiResponse({ status: 200, description: 'Affected subject found' })
  @ApiResponse({ status: 404, description: 'Affected subject not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.affectedService.findById(tenantId, id);
  }

  @Post(':id/notify')
  @Permissions('breach.manage')
  @ApiOperation({ summary: 'Mark an affected data subject as notified' })
  @ApiResponse({ status: 200, description: 'Subject marked as notified' })
  @ApiResponse({ status: 404, description: 'Affected subject not found' })
  async markNotified(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.affectedService.markNotified(tenantId, id, user.userId);
  }

  @Delete(':id')
  @Permissions('breach.manage')
  @ApiOperation({ summary: 'Delete an affected data subject record' })
  @ApiResponse({ status: 200, description: 'Affected subject deleted successfully' })
  @ApiResponse({ status: 404, description: 'Affected subject not found' })
  async delete(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.affectedService.delete(tenantId, id, user.userId);
    return { message: 'Affected data subject deleted successfully' };
  }
}
