import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditEntry } from '../../entities/audit-entry.entity';
import { AuditRetentionPolicy } from '../../entities/audit-retention.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditEntry, AuditRetentionPolicy])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
