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
import { ComplianceFramework } from './compliance-framework.entity';
import { ComplianceFinding } from './compliance-finding.entity';
import { RemediationSuggestion } from './remediation-suggestion.entity';

export enum ScanStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ScanType {
  FULL = 'FULL',
  INCREMENTAL = 'INCREMENTAL',
  TARGETED = 'TARGETED',
}

@Entity('compliance_scans')
export class ComplianceScan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  frameworkId: string;

  @ManyToOne(() => ComplianceFramework, (framework) => framework.scans)
  @JoinColumn({ name: 'frameworkId' })
  framework: ComplianceFramework;

  @Column({ type: 'enum', enum: ScanStatus, default: ScanStatus.PENDING })
  status: ScanStatus;

  @Column({ type: 'enum', enum: ScanType, default: ScanType.FULL })
  type: ScanType;

  @Column({ type: 'jsonb', nullable: true })
  scope: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallScore: number;

  @Column({ type: 'int', default: 0 })
  gapCount: number;

  @Column({ type: 'int', default: 0 })
  passCount: number;

  @Column({ type: 'int', default: 0 })
  failCount: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  triggeredBy: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => ComplianceFinding, (finding) => finding.scan)
  findings: ComplianceFinding[];

  @OneToMany(() => RemediationSuggestion, (remediation) => remediation.scan)
  remediations: RemediationSuggestion[];
}
