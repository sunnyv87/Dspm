import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: any;

  constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  async onModuleInit() {
    try {
      const { Kafka } = await import('kafkajs');
      const kafka = new Kafka({
        clientId: 'notification-service',
        brokers: (this.configService.get('kafka.brokers') || 'localhost:9092').split(','),
      });

      this.consumer = kafka.consumer({ groupId: 'notification-group' });
      await this.consumer.connect();
      await this.consumer.subscribe({ topics: ['notification.send', 'alert.created', 'breach.detected'], fromBeginning: false });

      await this.consumer.run({
        eachMessage: async ({ topic, message }: { topic: string; message: any }) => {
          try {
            const event = JSON.parse(message.value.toString());
            await this.notificationService.send({
              tenantId: event.tenantId,
              channel: event.channel || 'in_app',
              recipientId: event.recipientId,
              recipientEmail: event.recipientEmail,
              subject: event.subject || `[${topic}] Event`,
              body: event.body || JSON.stringify(event.payload),
              priority: event.priority || 'medium',
              templateId: event.templateId,
              templateData: event.templateData,
              relatedEntityType: event.relatedEntityType,
              relatedEntityId: event.relatedEntityId,
            });
          } catch (err) {
            this.logger.error(`Failed to process ${topic}: ${(err as Error).message}`);
          }
        },
      });
      this.logger.log('Kafka consumer connected');
    } catch (err) {
      this.logger.warn('Kafka consumer init skipped: ' + (err as Error).message);
    }
  }

  async onModuleDestroy() {
    if (this.consumer) await this.consumer.disconnect();
  }
}
