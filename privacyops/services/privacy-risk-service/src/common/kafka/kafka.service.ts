import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, logLevel } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService.get<string>('kafka.brokers')?.split(',') || ['localhost:9092'];
    this.kafka = new Kafka({
      clientId: 'privacy-risk-service',
      brokers,
      logLevel: logLevel.WARN,
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();
      this.isConnected = true;
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.warn(`Failed to connect Kafka producer: ${error.message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      this.logger.log('Kafka producer disconnected');
    } catch (error) {
      this.logger.warn(`Error disconnecting Kafka producer: ${error.message}`);
    }
  }

  async emit(topic: string, message: { key?: string; value: any; headers?: Record<string, string> }): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn(`Kafka not connected. Skipping emit to topic: ${topic}`);
      return;
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.key,
            value: JSON.stringify(message.value),
            headers: message.headers,
          },
        ],
      });
      this.logger.debug(`Message emitted to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to emit message to topic ${topic}: ${error.message}`);
    }
  }
}
