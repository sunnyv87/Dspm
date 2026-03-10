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
import { ComplianceFinding } from './compliance-finding.entity';
import { ComplianceScan } from './compliance-scan.entity';

export enum RemediationPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum RemediationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DISMISSED = 'DISMISSED',
}

@Entity('remediation_suggestions')
@Index(['tenantId', 'findingId'])
export class RemediationSuggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  findingId: string;

  @ManyToOne(() => ComplianceFinding, (finding) => finding.remediations)
  @JoinColumn({ name: 'findingId' })
  finding: ComplianceFinding;

  @Column({ type: 'uuid' })
  scanId: string;

  @ManyToOne(() => ComplianceScan, (scan) => scan.remediations)
  @JoinColumn({ name: 'scanId' })
  scan: ComplianceScan;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: RemediationPriority })
  priority: RemediationPriority;

  @Column({ type: 'enum', enum: RemediationStatus, default: RemediationStatus.PENDING })
  status: RemediationStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  estimatedEffort: string;

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string;

  @Column({ type: 'jsonb', default: [] })
  steps: Record<string, any>[];

  @Column({ type: 'jsonb', default: [] })
  resources: Record<string, any>[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
