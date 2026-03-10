import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { BreachNotification } from './breach-notification.entity';
import { BreachTimeline } from './breach-timeline.entity';
import { AffectedDataSubject } from './affected-data-subject.entity';

export enum BreachSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum BreachStatus {
  DETECTED = 'DETECTED',
  INVESTIGATING = 'INVESTIGATING',
  CONTAINED = 'CONTAINED',
  ERADICATED = 'ERADICATED',
  RECOVERED = 'RECOVERED',
  CLOSED = 'CLOSED',
}

export enum BreachType {
  DATA_LEAK = 'DATA_LEAK',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  RANSOMWARE = 'RANSOMWARE',
  PHISHING = 'PHISHING',
  INSIDER_THREAT = 'INSIDER_THREAT',
  SYSTEM_COMPROMISE = 'SYSTEM_COMPROMISE',
  THIRD_PARTY_BREACH = 'THIRD_PARTY_BREACH',
  OTHER = 'OTHER',
}

@Entity('breach_incidents')
@Index(['tenantId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'severity'])
export class BreachIncident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: BreachSeverity })
  severity: BreachSeverity;

  @Column({ type: 'enum', enum: BreachStatus, default: BreachStatus.DETECTED })
  status: BreachStatus;

  @Column({ type: 'enum', enum: BreachType })
  type: BreachType;

  @Column({ type: 'timestamp with time zone', nullable: true })
  detectedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  reportedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  containedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'jsonb', default: [] })
  affectedDataTypes: string[];

  @Column({ type: 'jsonb', default: [] })
  affectedSystems: string[];

  @Column({ type: 'int', nullable: true })
  estimatedAffectedCount: number;

  @Column({ type: 'text', nullable: true })
  rootCause: string;

  @Column({ type: 'text', nullable: true })
  impactAssessment: string;

  @Column({ type: 'uuid', nullable: true })
  leadInvestigatorId: string;

  @Column({ type: 'jsonb', default: [] })
  assignedTeam: string[];

  @Column({ type: 'boolean', default: false })
  regulatoryReportRequired: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  regulatoryReportDeadline: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => BreachNotification, (n) => n.incident)
  notifications: BreachNotification[];

  @OneToMany(() => BreachTimeline, (t) => t.incident)
  timelineEntries: BreachTimeline[];

  @OneToMany(() => AffectedDataSubject, (a) => a.incident)
  affectedSubjects: AffectedDataSubject[];
}
