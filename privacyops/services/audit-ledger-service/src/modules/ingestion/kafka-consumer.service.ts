import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: any;

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  async onModuleInit() {
    try {
      const { Kafka } = await import('kafkajs');
      const kafka = new Kafka({
        clientId: 'audit-ledger-service',
        brokers: (
          this.configService.get('kafka.brokers') || 'localhost:9092'
        ).split(','),
      });

      this.consumer = kafka.consumer({ groupId: 'audit-ledger-group' });
      await this.consumer.connect();
      await this.consumer.subscribe({
        topics: ['audit.events', 'auth.events', 'privacy.events'],
        fromBeginning: false,
      });

      await this.consumer.run({
        eachMessage: async ({
          topic,
          message,
        }: {
          topic: string;
          message: any;
        }) => {
          try {
            const event = JSON.parse(message.value.toString());
            await this.auditService.createEntry({
              tenantId: event.tenantId,
              userId: event.userId,
              action: event.action || event.eventType,
              entityType: event.entityType || event.resource || topic.split('.')[0],
              entityId: event.entityId || event.resourceId || event.aggregateId,
              ipAddress: event.ipAddress || '0.0.0.0',
              userAgent: event.userAgent || 'system',
              changes: event.changes,
              metadata: event.metadata,
            });
          } catch (err) {
            this.logger.error(
              `Failed to process message from ${topic}: ${(err as Error).message}`,
            );
          }
        },
      });

      this.logger.log('Kafka consumer connected and subscribed');
    } catch (err) {
      this.logger.warn(
        'Kafka consumer initialization skipped: ' + (err as Error).message,
      );
    }
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }
}
