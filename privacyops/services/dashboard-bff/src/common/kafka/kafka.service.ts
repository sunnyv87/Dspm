import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService
      .get<string>('kafka.brokers', 'localhost:9092')
      .split(',');

    this.kafka = new Kafka({
      clientId: 'dashboard-bff',
      brokers,
      logLevel: logLevel.WARN,
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId: 'dashboard-bff-group',
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.warn(`Failed to connect Kafka producer: ${error.message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.logger.log('Kafka connections closed');
    } catch (error) {
      this.logger.warn(`Error disconnecting Kafka: ${error.message}`);
    }
  }

  async emit(topic: string, message: any): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.tenantId || 'default',
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      });
    } catch (error) {
      this.logger.warn(`Failed to emit to ${topic}: ${error.message}`);
    }
  }

  async subscribe(
    topic: string,
    callback: (message: any) => Promise<void>,
  ): Promise<void> {
    try {
      await this.consumer.subscribe({ topic, fromBeginning: false });
      await this.consumer.run({
        eachMessage: async ({ message }) => {
          const value = message.value
            ? JSON.parse(message.value.toString())
            : null;
          if (value) {
            await callback(value);
          }
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to subscribe to ${topic}: ${error.message}`,
      );
    }
  }
}
