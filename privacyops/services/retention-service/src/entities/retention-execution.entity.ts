import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RetentionPolicy } from './retention-policy.entity';
import { RetentionSchedule } from './retention-schedule.entity';

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('retention_executions')
@Index(['tenantId', 'policyId'])
@Index(['tenantId', 'scheduleId'])
export class RetentionExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  scheduleId: string | null;

  @ManyToOne(() => RetentionSchedule, (schedule) => schedule.executions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'scheduleId' })
  schedule: RetentionSchedule;

  @Column({ type: 'uuid' })
  policyId: string;

  @ManyToOne(() => RetentionPolicy, (policy) => policy.executions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'policyId' })
  policy: RetentionPolicy;

  @Column({ type: 'enum', enum: ExecutionStatus, default: ExecutionStatus.PENDING })
  status: ExecutionStatus;

  @Column({ type: 'int', default: 0 })
  recordsProcessed: number;

  @Column({ type: 'int', default: 0 })
  recordsDeleted: number;

  @Column({ type: 'int', default: 0 })
  recordsArchived: number;

  @Column({ type: 'int', default: 0 })
  recordsAnonymized: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
