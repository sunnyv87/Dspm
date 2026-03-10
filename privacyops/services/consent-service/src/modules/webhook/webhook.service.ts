import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ConsentWebhook } from '../../entities/consent-webhook.entity';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/create-webhook.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(ConsentWebhook)
    private readonly webhookRepository: Repository<ConsentWebhook>,
  ) {}

  async create(
    tenantId: string,
    createdBy: string,
    dto: CreateWebhookDto,
  ): Promise<ConsentWebhook> {
    const webhook = this.webhookRepository.create({
      tenantId,
      createdBy,
      name: dto.name,
      url: dto.url,
      secret: dto.secret,
      events: dto.events,
      isActive: dto.isActive !== false,
    });

    const saved = await this.webhookRepository.save(webhook);
    this.logger.log(`Created webhook "${saved.name}" (${saved.id}) for tenant ${tenantId}`);
    return saved;
  }

  async findAll(tenantId: string): Promise<ConsentWebhook[]> {
    return this.webhookRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(tenantId: string, id: string): Promise<ConsentWebhook> {
    const webhook = await this.webhookRepository.findOne({
      where: { id, tenantId },
    });

    if (!webhook) {
      throw new NotFoundException(`Webhook with ID "${id}" not found`);
    }

    return webhook;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateWebhookDto,
  ): Promise<ConsentWebhook> {
    const webhook = await this.findById(tenantId, id);

    if (dto.name !== undefined) webhook.name = dto.name;
    if (dto.url !== undefined) webhook.url = dto.url;
    if (dto.secret !== undefined) webhook.secret = dto.secret;
    if (dto.events !== undefined) webhook.events = dto.events;
    if (dto.isActive !== undefined) webhook.isActive = dto.isActive;

    const saved = await this.webhookRepository.save(webhook);
    this.logger.log(`Updated webhook "${saved.name}" (${saved.id}) for tenant ${tenantId}`);
    return saved;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const webhook = await this.findById(tenantId, id);
    await this.webhookRepository.remove(webhook);
    this.logger.log(`Deleted webhook "${webhook.name}" (${id}) for tenant ${tenantId}`);
  }

  async testWebhook(tenantId: string, id: string): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    const webhook = await this.findById(tenantId, id);

    const testPayload = {
      event: 'webhook.test',
      tenantId,
      webhookId: webhook.id,
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook delivery' },
    };

    try {
      const result = await this.deliverWebhook(webhook, testPayload);
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async triggerWebhooks(
    tenantId: string,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<void> {
    const webhooks = await this.webhookRepository.find({
      where: { tenantId, isActive: true },
    });

    const matchingWebhooks = webhooks.filter((wh) =>
      wh.events.includes(eventType),
    );

    if (matchingWebhooks.length === 0) {
      return;
    }

    const deliveryPayload = {
      event: eventType,
      tenantId,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    // Fire-and-forget delivery to all matching webhooks
    for (const webhook of matchingWebhooks) {
      this.deliverWebhook(webhook, deliveryPayload)
        .then(async (result) => {
          if (result.success) {
            webhook.lastTriggeredAt = new Date();
            webhook.failureCount = 0;
            await this.webhookRepository.save(webhook);
          } else {
            webhook.failureCount += 1;
            await this.webhookRepository.save(webhook);
            this.logger.warn(
              `Webhook "${webhook.name}" (${webhook.id}) delivery failed: ${result.error}`,
            );
          }
        })
        .catch((err) => {
          this.logger.error(
            `Webhook "${webhook.name}" (${webhook.id}) delivery error: ${err.message}`,
          );
        });
    }
  }

  private async deliverWebhook(
    webhook: ConsentWebhook,
    payload: Record<string, any>,
  ): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    const body = JSON.stringify(payload);

    // Compute HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(body)
      .digest('hex');

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event || 'unknown',
          'X-Webhook-Id': webhook.id,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        return { success: true, statusCode: response.status };
      } else {
        return {
          success: false,
          statusCode: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}
