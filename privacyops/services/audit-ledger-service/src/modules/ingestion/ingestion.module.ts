import { Module } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [KafkaConsumerService],
})
export class IngestionModule {}
