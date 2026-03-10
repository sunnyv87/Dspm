import { Controller, Get, Post, Put, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { TemplateService } from './template.service';

@ApiTags('Notifications')
@Controller()
export class NotificationController {
  constructor(
    private service: NotificationService,
    private templateService: TemplateService,
  ) {}

  @Post('send')
  send(@Body() data: any) { return this.service.send(data); }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('recipientId') recipientId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.findByRecipient(tenantId, recipientId, page, pageSize);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.service.markAsRead(id, tenantId);
  }

  @Get('unread-count')
  unreadCount(@Query('tenantId') tenantId: string, @Query('recipientId') recipientId: string) {
    return this.service.getUnreadCount(tenantId, recipientId);
  }

  @Post('preferences')
  updatePreferences(@Body() body: { userId: string; tenantId: string; preferences: any[] }) {
    return this.service.updatePreferences(body.userId, body.tenantId, body.preferences);
  }

  @Post('retry-failed')
  retryFailed() { return this.service.retryFailed(); }

  @Get('templates')
  getTemplates() { return this.templateService.findAll(); }

  @Post('templates')
  createTemplate(@Body() data: any) { return this.templateService.create(data); }

  @Put('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() data: any) { return this.templateService.update(id, data); }
}
