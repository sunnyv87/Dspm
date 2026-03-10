import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../../entities/notification.entity';
import { NotificationPreferenceEntity } from '../../entities/notification-preference.entity';
import { ChannelRouter } from '../channel/channel-router.service';
import { TemplateService } from './template.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity) private notifRepo: Repository<NotificationEntity>,
    @InjectRepository(NotificationPreferenceEntity) private prefRepo: Repository<NotificationPreferenceEntity>,
    private channelRouter: ChannelRouter,
    private templateService: TemplateService,
  ) {}

  async send(data: {
    tenantId: string;
    channel: string;
    recipientId: string;
    recipientEmail?: string;
    subject: string;
    body: string;
    priority?: string;
    templateId?: string;
    templateData?: Record<string, unknown>;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) {
    // Check preferences
    const pref = await this.prefRepo.findOne({
      where: { userId: data.recipientId, tenantId: data.tenantId, channel: data.channel as any },
    });
    if (pref && !pref.enabled) {
      this.logger.debug(`Notification suppressed by user preference for ${data.recipientId}`);
      return null;
    }

    // Render template if provided
    let subject = data.subject;
    let body = data.body;
    if (data.templateId && data.templateData) {
      const rendered = await this.templateService.render(data.templateId, data.templateData);
      if (rendered) {
        subject = rendered.subject;
        body = rendered.body;
      }
    }

    // Create notification record
    const notification = this.notifRepo.create({
      tenantId: data.tenantId,
      channel: data.channel,
      recipientId: data.recipientId,
      recipientEmail: data.recipientEmail,
      subject,
      body,
      priority: data.priority || 'medium',
      templateId: data.templateId,
      templateData: data.templateData,
      relatedEntityType: data.relatedEntityType,
      relatedEntityId: data.relatedEntityId,
    });
    await this.notifRepo.save(notification);

    // Send via channel
    const result = await this.channelRouter.send(data.channel, {
      recipient: data.recipientEmail || data.recipientId,
      subject,
      body,
    });

    if (result.success) {
      notification.status = 'sent';
      notification.sentAt = new Date();
    } else {
      notification.status = 'failed';
      notification.failureReason = result.error || 'Unknown error';
      notification.retryCount += 1;
    }
    await this.notifRepo.save(notification);

    return notification;
  }

  async findByRecipient(tenantId: string, recipientId: string, page = 1, pageSize = 20) {
    const [data, total] = await this.notifRepo.findAndCount({
      where: { tenantId, recipientId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { data, meta: { page, pageSize, totalItems: total, totalPages: Math.ceil(total / pageSize) } };
  }

  async markAsRead(id: string, tenantId: string) {
    await this.notifRepo.update({ id, tenantId }, { status: 'read', readAt: new Date() });
  }

  async getUnreadCount(tenantId: string, recipientId: string) {
    return this.notifRepo.count({ where: { tenantId, recipientId, status: 'sent' } });
  }

  async updatePreferences(userId: string, tenantId: string, prefs: Array<{ channel: string; category: string; enabled: boolean }>) {
    for (const p of prefs) {
      const existing = await this.prefRepo.findOne({
        where: { userId, tenantId, channel: p.channel as any, category: p.category },
      });
      if (existing) {
        existing.enabled = p.enabled;
        await this.prefRepo.save(existing);
      } else {
        await this.prefRepo.save(this.prefRepo.create({ userId, tenantId, ...p }));
      }
    }
  }

  async retryFailed() {
    const failed = await this.notifRepo.find({
      where: { status: 'failed' },
    });
    let retried = 0;
    for (const n of failed) {
      if (n.retryCount >= n.maxRetries) continue;
      const result = await this.channelRouter.send(n.channel, {
        recipient: n.recipientEmail || n.recipientId,
        subject: n.subject,
        body: n.body,
      });
      n.retryCount += 1;
      if (result.success) {
        n.status = 'sent';
        n.sentAt = new Date();
      } else {
        n.failureReason = result.error || 'Retry failed';
      }
      await this.notifRepo.save(n);
      retried++;
    }
    return { retried };
  }
}
