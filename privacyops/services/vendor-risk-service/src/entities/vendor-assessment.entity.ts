import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Vendor, RiskLevel } from './vendor.entity';
import { VendorQuestionnaire } from './vendor-questionnaire.entity';
import { RiskFinding } from './risk-finding.entity';

export enum AssessmentType {
  INITIAL = 'INITIAL',
  PERIODIC = 'PERIODIC',
  TRIGGERED = 'TRIGGERED',
  REASSESSMENT = 'REASSESSMENT',
}

export enum AssessmentStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('vendor_assessments')
@Index(['tenantId', 'vendorId'])
export class VendorAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.assessments)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'uuid' })
  assessorId: string;

  @Column({ type: 'enum', enum: AssessmentType, default: AssessmentType.INITIAL })
  type: AssessmentType;

  @Column({ type: 'enum', enum: AssessmentStatus, default: AssessmentStatus.DRAFT })
  status: AssessmentStatus;

  @Column({ type: 'int', nullable: true })
  overallScore: number;

  @Column({ type: 'enum', enum: RiskLevel, default: RiskLevel.UNKNOWN })
  riskLevel: RiskLevel;

  @Column({ type: 'jsonb', default: [] })
  findings: Record<string, any>[];

  @Column({ type: 'jsonb', default: [] })
  recommendations: Record<string, any>[];

  @Column({ type: 'timestamp with time zone', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => VendorQuestionnaire, (q) => q.assessment)
  questionnaires: VendorQuestionnaire[];

  @OneToMany(() => RiskFinding, (f) => f.assessment)
  riskFindings: RiskFinding[];
}
