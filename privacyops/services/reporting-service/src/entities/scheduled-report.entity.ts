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
import { ReportDefinition } from './report-definition.entity';

export enum ScheduledReportStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DISABLED = 'DISABLED',
}

@Entity('scheduled_reports')
@Index(['tenantId', 'definitionId'])
export class ScheduledReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  definitionId: string;

  @ManyToOne(() => ReportDefinition, (definition) => definition.scheduledReports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'definitionId' })
  definition: ReportDefinition;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  cronExpression: string;

  @Column({ type: 'jsonb', default: '[]' })
  recipients: string[];

  @Column({ type: 'enum', enum: ScheduledReportStatus, default: ScheduledReportStatus.ACTIVE })
  status: ScheduledReportStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastRunAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  nextRunAt: Date | null;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
