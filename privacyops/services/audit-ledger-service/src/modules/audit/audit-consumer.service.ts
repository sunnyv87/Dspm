import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventPattern, Payload, Ctx } from '@nestjs/microservices';
import { KafkaContext } from '@nestjs/microservices';
import { AuditService } from './audit.service';
import { AuditAction, AuditSeverity } from '../../entities/audit-entry.entity';
import { CreateAuditEntryDto } from './dto/create-audit-entry.dto';

interface KafkaAuditMessage {
  tenantId: string;
  userId?: string;
  userEmail?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  changes?: { before?: Record<string, any>; after?: Record<string, any> };
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity?: string;
  timestamp?: string;
}

@Injectable()
export class AuditConsumerService implements OnModuleInit {
  private readonly logger = new Logger(AuditConsumerService.name);

  constructor(private readonly auditService: AuditService) {}

  onModuleInit() {
    this.logger.log('Audit Kafka consumer initialized');
  }

  @EventPattern('audit.entry.created')
  async handleAuditEntryCreated(
    @Payload() message: KafkaAuditMessage,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    await this.processMessage('audit.entry.created', message, context);
  }

  @EventPattern('auth.login')
  async handleAuthLogin(
    @Payload() message: KafkaAuditMessage,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const enriched: KafkaAuditMessage = {
      ...message,
      action: AuditAction.LOGIN,
      entityType: message.entityType || 'auth_session',
      severity: message.severity || AuditSeverity.INFO,
    };
    await this.processMessage('auth.login', enriched, context);
  }

  @EventPattern('auth.logout')
  async handleAuthLogout(
    @Payload() message: KafkaAuditMessage,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const enriched: KafkaAuditMessage = {
      ...message,
      action: AuditAction.LOGOUT,
      entityType: message.entityType || 'auth_session',
      severity: message.severity || AuditSeverity.INFO,
    };
    await this.processMessage('auth.logout', enriched, context);
  }

  @EventPattern('consent.granted')
  async handleConsentGranted(
    @Payload() message: KafkaAuditMessage,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const enriched: KafkaAuditMessage = {
      ...message,
      action: AuditAction.CONSENT_GRANT,
      entityType: message.entityType || 'consent',
      severity: message.severity || AuditSeverity.INFO,
    };
    await this.processMessage('consent.granted', enriched, context);
  }

  @EventPattern('consent.withdrawn')
  async handleConsentWithdrawn(
    @Payload() message: KafkaAuditMessage,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const enriched: KafkaAuditMessage = {
      ...message,
      action: AuditAction.CONSENT_WITHDRAW,
      entityType: message.entityType || 'consent',
      severity: message.severity || AuditSeverity.WARNING,
    };
    await this.processMessage('consent.withdrawn', enriched, context);
  }

  @EventPattern('breach.detected')
  async handleBreachDetected(
    @Payload() message: KafkaAuditMessage,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const enriched: KafkaAuditMessage = {
      ...message,
      action: AuditAction.BREACH_REPORT,
      entityType: message.entityType || 'breach',
      severity: AuditSeverity.CRITICAL,
    };
    await this.processMessage('breach.detected', enriched, context);
  }

  @EventPattern('breach.reported')
  async handleBreachReported(
    @Payload() message: KafkaAuditMessage,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const enriched: KafkaAuditMessage = {
      ...message,
      action: AuditAction.BREACH_REPORT,
      entityType: message.entityType || 'breach',
      severity: AuditSeverity.CRITICAL,
    };
    await this.processMessage('breach.reported', enriched, context);
  }

  @EventPattern('rights.requested')
  async handleRightsRequested(
    @Payload() message: KafkaAuditMessage,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const enriched: KafkaAuditMessage = {
      ...message,
      action: AuditAction.RIGHTS_REQUEST,
      entityType: message.entityType || 'rights_request',
      severity: message.severity || AuditSeverity.INFO,
    };
    await this.processMessage('rights.requested', enriched, context);
  }

  @EventPattern('rights.completed')
  async handleRightsCompleted(
    @Payload() message: KafkaAuditMessage,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const enriched: KafkaAuditMessage = {
      ...message,
      action: message.action as AuditAction || AuditAction.UPDATE,
      entityType: message.entityType || 'rights_request',
      severity: message.severity || AuditSeverity.INFO,
    };
    await this.processMessage('rights.completed', enriched, context);
  }

  @EventPattern('workflow.step.completed')
  async handleWorkflowStepCompleted(
    @Payload() message: KafkaAuditMessage,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const enriched: KafkaAuditMessage = {
      ...message,
      action: message.action as AuditAction || AuditAction.UPDATE,
      entityType: message.entityType || 'workflow',
      severity: message.severity || AuditSeverity.INFO,
    };
    await this.processMessage('workflow.step.completed', enriched, context);
  }

  private async processMessage(
    topic: string,
    message: KafkaAuditMessage,
    context: KafkaContext,
  ): Promise<void> {
    const partition = context.getPartition?.();
    const offset = context.getMessage?.()?.offset;

    this.logger.debug(
      `Processing message from topic=${topic} partition=${partition} offset=${offset}`,
    );

    try {
      if (!message.tenantId) {
        this.logger.warn(
          `Skipping message from topic=${topic}: missing tenantId`,
        );
        return;
      }

      if (!message.action || !Object.values(AuditAction).includes(message.action as AuditAction)) {
        this.logger.warn(
          `Skipping message from topic=${topic}: invalid or missing action "${message.action}"`,
        );
        return;
      }

      const dto: CreateAuditEntryDto = {
        tenantId: message.tenantId,
        userId: message.userId,
        userEmail: message.userEmail || '',
        action: message.action as AuditAction,
        entityType: message.entityType || 'unknown',
        entityId: message.entityId,
        changes: message.changes,
        metadata: {
          ...message.metadata,
          kafkaTopic: topic,
          kafkaPartition: partition,
          kafkaOffset: offset,
        },
        ipAddress: message.ipAddress,
        userAgent: message.userAgent,
        severity: (message.severity as AuditSeverity) || AuditSeverity.INFO,
      };

      await this.auditService.createEntry(dto);

      this.logger.debug(
        `Successfully processed audit entry from topic=${topic} action=${dto.action} entityType=${dto.entityType}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process message from topic=${topic}: ${error.message}`,
        error.stack,
      );
      // Do not rethrow - message will be acknowledged to prevent reprocessing loops
      // In production, consider dead-letter topic for failed messages
    }
  }
}
