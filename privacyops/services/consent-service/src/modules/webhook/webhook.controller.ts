import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/create-webhook.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Webhooks')
@ApiBearerAuth('bearer')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @Permissions('consent.manage')
  @ApiOperation({ summary: 'Create a new webhook' })
  @ApiResponse({ status: 201, description: 'Webhook created' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateWebhookDto,
  ) {
    return this.webhookService.create(tenantId, user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List webhooks for tenant' })
  @ApiResponse({ status: 200, description: 'List of webhooks' })
  async findAll(@TenantId() tenantId: string) {
    return this.webhookService.findAll(tenantId);
  }

  @Put(':id')
  @Permissions('consent.manage')
  @ApiOperation({ summary: 'Update a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook updated' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWebhookDto,
  ) {
    return this.webhookService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Permissions('consent.manage')
  @ApiOperation({ summary: 'Delete a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook deleted' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.webhookService.remove(tenantId, id);
    return { message: 'Webhook deleted successfully' };
  }

  @Post(':id/test')
  @Permissions('consent.manage')
  @ApiOperation({ summary: 'Test a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook test result' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async test(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.webhookService.testWebhook(tenantId, id);
  }
}
