import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ASSIGN = 'ASSIGN',
  ESCALATE = 'ESCALATE',
  CONSENT_GRANT = 'CONSENT_GRANT',
  CONSENT_WITHDRAW = 'CONSENT_WITHDRAW',
  BREACH_REPORT = 'BREACH_REPORT',
  RIGHTS_REQUEST = 'RIGHTS_REQUEST',
  POLICY_CHANGE = 'POLICY_CHANGE',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export interface AuditChanges {
  before?: Record<string, any>;
  after?: Record<string, any>;
}

@Entity('audit_entries')
@Index('idx_audit_tenant_timestamp', ['tenantId', 'timestamp'])
@Index('idx_audit_tenant_entity', ['tenantId', 'entityType', 'entityId'])
export class AuditEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index('idx_audit_tenant_id')
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 255, default: '' })
  userEmail: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_audit_entity_type')
  entityType: string;

  @Column({ type: 'uuid', nullable: true })
  entityId: string | null;

  @Column({ type: 'jsonb', nullable: true, default: null })
  changes: AuditChanges | null;

  @Column({ type: 'jsonb', nullable: true, default: null })
  metadata: Record<string, any> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent: string | null;

  @Column({
    type: 'enum',
    enum: AuditSeverity,
    default: AuditSeverity.INFO,
  })
  severity: AuditSeverity;

  @CreateDateColumn({ type: 'timestamptz' })
  @Index('idx_audit_timestamp')
  timestamp: Date;
}
