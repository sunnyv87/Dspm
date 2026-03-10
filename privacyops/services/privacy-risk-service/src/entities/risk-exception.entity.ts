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

export enum RiskExceptionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('risk_exceptions')
export class RiskException {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  riskAssessmentId: string;

  @ManyToOne(() => RiskAssessment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'riskAssessmentId' })
  riskAssessment: RiskAssessment;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: RiskExceptionStatus,
    default: RiskExceptionStatus.PENDING,
  })
  status: RiskExceptionStatus;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
