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
import { ProcessingActivity } from './processing-activity.entity';

export enum RiskCategory {
  DATA_EXPOSURE = 'data_exposure',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  DATA_BREACH = 'data_breach',
  CONSENT_VIOLATION = 'consent_violation',
  RETENTION_VIOLATION = 'retention_violation',
  CROSS_BORDER_TRANSFER = 'cross_border_transfer',
  VENDOR_RISK = 'vendor_risk',
}

export enum RiskLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  NEGLIGIBLE = 'negligible',
}

export enum RiskAssessmentStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  MITIGATED = 'mitigated',
}

@Entity('risk_assessments')
export class RiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  processingActivityId: string;

  @ManyToOne(() => ProcessingActivity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'processingActivityId' })
  processingActivity: ProcessingActivity;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: RiskCategory })
  category: RiskCategory;

  @Column({ type: 'enum', enum: RiskLevel })
  riskLevel: RiskLevel;

  @Column({ type: 'int' })
  likelihood: number;

  @Column({ type: 'int' })
  impact: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  riskScore: number;

  @Column({
    type: 'enum',
    enum: RiskAssessmentStatus,
    default: RiskAssessmentStatus.DRAFT,
  })
  status: RiskAssessmentStatus;

  @Column({ type: 'varchar', length: 100, default: 'qualitative' })
  methodology: string;

  @Column({ type: 'varchar', length: 20, default: '1.0' })
  methodologyVersion: string;

  @Column({ type: 'jsonb', nullable: true })
  findings: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  mitigationPlan: string;

  @Column({ type: 'enum', enum: RiskLevel, nullable: true })
  residualRiskLevel: RiskLevel;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  residualRiskScore: number;

  @Column({ type: 'uuid', nullable: true })
  reviewerId: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  relatedAssetIds: string[];

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
