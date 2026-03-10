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
import { ComplianceScan } from './compliance-scan.entity';
import { ComplianceFramework } from './compliance-framework.entity';
import { RemediationSuggestion } from './remediation-suggestion.entity';

export enum FindingStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  PARTIAL = 'PARTIAL',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export enum FindingSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

@Entity('compliance_findings')
@Index(['tenantId', 'scanId'])
export class ComplianceFinding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  scanId: string;

  @ManyToOne(() => ComplianceScan, (scan) => scan.findings)
  @JoinColumn({ name: 'scanId' })
  scan: ComplianceScan;

  @Column({ type: 'uuid' })
  frameworkId: string;

  @ManyToOne(() => ComplianceFramework, (framework) => framework.findings)
  @JoinColumn({ name: 'frameworkId' })
  framework: ComplianceFramework;

  @Column({ type: 'varchar', length: 255 })
  controlId: string;

  @Column({ type: 'varchar', length: 500 })
  controlName: string;

  @Column({ type: 'enum', enum: FindingStatus })
  status: FindingStatus;

  @Column({ type: 'enum', enum: FindingSeverity })
  severity: FindingSeverity;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  evidence: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  recommendation: string;

  @Column({ type: 'jsonb', default: [] })
  affectedResources: Record<string, any>[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => RemediationSuggestion, (remediation) => remediation.finding)
  remediations: RemediationSuggestion[];
}
