import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('bearer')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Permissions('breach.manage')
  @ApiOperation({ summary: 'Create a new breach notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationService.create(tenantId, user.userId, dto);
  }

  @Get()
  @Permissions('breach.read')
  @ApiOperation({ summary: 'List breach notifications for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of notifications' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryNotificationDto,
  ) {
    return this.notificationService.findAll(tenantId, query);
  }

  @Get(':id')
  @Permissions('breach.read')
  @ApiOperation({ summary: 'Get a breach notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification found' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationService.findById(tenantId, id);
  }

  @Post(':id/send')
  @Permissions('breach.manage')
  @ApiOperation({ summary: 'Send a breach notification' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async send(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationService.send(tenantId, id, user.userId);
  }

  @Post(':id/delivered')
  @Permissions('breach.manage')
  @ApiOperation({ summary: 'Mark a breach notification as delivered' })
  @ApiResponse({ status: 200, description: 'Notification marked as delivered' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markDelivered(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationService.markDelivered(tenantId, id);
  }

  @Post(':id/failed')
  @Permissions('breach.manage')
  @ApiOperation({ summary: 'Mark a breach notification as failed' })
  @ApiResponse({ status: 200, description: 'Notification marked as failed' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markFailed(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationService.markFailed(tenantId, id);
  }
}
