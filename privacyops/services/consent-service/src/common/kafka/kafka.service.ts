import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, logLevel } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private connected = false;

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get<string>('kafka.clientId') || 'consent-service',
      brokers: this.configService.get<string[]>('kafka.brokers') || ['localhost:9092'],
      logLevel: logLevel.WARN,
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.connected = true;
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.warn(`Kafka producer connection failed: ${(error as Error).message}. Events will not be published.`);
    }
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.producer.disconnect();
    }
  }

  async emit(topic: string, event: { key?: string; value: Record<string, any> }) {
    if (!this.connected) {
      this.logger.warn(`Kafka not connected. Dropping event on topic: ${topic}`);
      return;
    }

    await this.producer.send({
      topic,
      messages: [
        {
          key: event.key || undefined,
          value: JSON.stringify(event.value),
        },
      ],
    });
  }
}
