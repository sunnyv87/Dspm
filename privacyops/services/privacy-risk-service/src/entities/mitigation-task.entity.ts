import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RiskAssessment } from './risk-assessment.entity';

export enum MitigationPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum MitigationStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

@Entity('mitigation_tasks')
export class MitigationTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  riskAssessmentId: string;

  @ManyToOne(() => RiskAssessment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'riskAssessmentId' })
  riskAssessment: RiskAssessment;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string;

  @Column({
    type: 'enum',
    enum: MitigationPriority,
    default: MitigationPriority.MEDIUM,
  })
  priority: MitigationPriority;

  @Column({
    type: 'enum',
    enum: MitigationStatus,
    default: MitigationStatus.OPEN,
  })
  status: MitigationStatus;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  completedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  evidence: Record<string, any>;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
