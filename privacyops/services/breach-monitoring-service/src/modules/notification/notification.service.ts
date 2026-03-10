import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BreachNotification,
  NotificationStatus,
} from '../../entities/breach-notification.entity';
import { BreachIncident } from '../../entities/breach-incident.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(BreachNotification)
    private readonly notificationRepository: Repository<BreachNotification>,
    @InjectRepository(BreachIncident)
    private readonly incidentRepository: Repository<BreachIncident>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    dto: CreateNotificationDto,
  ): Promise<BreachNotification> {
    // Verify incident exists and belongs to tenant
    const incident = await this.incidentRepository.findOne({
      where: { id: dto.incidentId, tenantId },
    });

    if (!incident) {
      throw new NotFoundException(
        `Breach incident with ID "${dto.incidentId}" not found`,
      );
    }

    const notification = this.notificationRepository.create({
      tenantId,
      incidentId: dto.incidentId,
      recipientType: dto.recipientType,
      recipientName: dto.recipientName,
      recipientEmail: dto.recipientEmail || null,
      status: NotificationStatus.DRAFT,
      templateName: dto.templateName || null,
      content: dto.content || null,
      channel: dto.channel || undefined,
    });

    const saved = await this.notificationRepository.save(notification);

    this.logger.log(
      `Created breach notification (${saved.id}) for incident ${dto.incidentId} tenant ${tenantId}`,
    );

    await this.kafkaService.emit('breach.notification.created', {
      key: saved.id,
      value: {
        eventType: 'breach.notification.created',
        tenantId,
        userId,
        notificationId: saved.id,
        incidentId: dto.incidentId,
        recipientType: saved.recipientType,
        channel: saved.channel,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryNotificationDto,
  ): Promise<{ data: BreachNotification[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.tenantId = :tenantId', { tenantId });

    if (query.incidentId) {
      qb.andWhere('notification.incidentId = :incidentId', {
        incidentId: query.incidentId,
      });
    }

    if (query.recipientType) {
      qb.andWhere('notification.recipientType = :recipientType', {
        recipientType: query.recipientType,
      });
    }

    if (query.status) {
      qb.andWhere('notification.status = :status', { status: query.status });
    }

    if (query.channel) {
      qb.andWhere('notification.channel = :channel', { channel: query.channel });
    }

    qb.orderBy('notification.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<BreachNotification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, tenantId },
      relations: ['incident'],
    });

    if (!notification) {
      throw new NotFoundException(`Breach notification with ID "${id}" not found`);
    }

    return notification;
  }

  async send(
    tenantId: string,
    id: string,
    userId: string,
  ): Promise<BreachNotification> {
    const notification = await this.findById(tenantId, id);

    notification.status = NotificationStatus.SENT;
    notification.sentAt = new Date();

    const saved = await this.notificationRepository.save(notification);

    this.logger.log(
      `Sent breach notification (${saved.id}) for incident ${saved.incidentId} tenant ${tenantId}`,
    );

    await this.kafkaService.emit('breach.notification.sent', {
      key: saved.id,
      value: {
        eventType: 'breach.notification.sent',
        tenantId,
        userId,
        notificationId: saved.id,
        incidentId: saved.incidentId,
        recipientType: saved.recipientType,
        channel: saved.channel,
        sentAt: saved.sentAt.toISOString(),
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async markDelivered(
    tenantId: string,
    id: string,
  ): Promise<BreachNotification> {
    const notification = await this.findById(tenantId, id);

    notification.status = NotificationStatus.DELIVERED;
    notification.deliveredAt = new Date();

    const saved = await this.notificationRepository.save(notification);

    this.logger.log(
      `Marked breach notification (${saved.id}) as delivered for tenant ${tenantId}`,
    );

    return saved;
  }

  async markFailed(
    tenantId: string,
    id: string,
  ): Promise<BreachNotification> {
    const notification = await this.findById(tenantId, id);

    notification.status = NotificationStatus.FAILED;

    const saved = await this.notificationRepository.save(notification);

    this.logger.log(
      `Marked breach notification (${saved.id}) as failed for tenant ${tenantId}`,
    );

    return saved;
  }
}
