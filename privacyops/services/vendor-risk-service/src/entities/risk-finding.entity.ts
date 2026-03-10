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
import { Vendor } from './vendor.entity';
import { VendorAssessment } from './vendor-assessment.entity';

export enum FindingSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export enum FindingStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  MITIGATED = 'MITIGATED',
  ACCEPTED = 'ACCEPTED',
  CLOSED = 'CLOSED',
}

@Entity('risk_findings')
@Index(['tenantId', 'vendorId'])
export class RiskFinding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.findings)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'uuid', nullable: true })
  assessmentId: string;

  @ManyToOne(() => VendorAssessment, (assessment) => assessment.riskFindings, { nullable: true })
  @JoinColumn({ name: 'assessmentId' })
  assessment: VendorAssessment;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  category: string;

  @Column({ type: 'enum', enum: FindingSeverity, default: FindingSeverity.MEDIUM })
  severity: FindingSeverity;

  @Column({ type: 'enum', enum: FindingStatus, default: FindingStatus.OPEN })
  status: FindingStatus;

  @Column({ type: 'text', nullable: true })
  remediationPlan: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
