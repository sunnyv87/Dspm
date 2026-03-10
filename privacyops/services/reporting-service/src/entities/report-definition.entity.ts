import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ReportExecution } from './report-execution.entity';
import { ScheduledReport } from './scheduled-report.entity';

export enum ReportType {
  COMPLIANCE = 'COMPLIANCE',
  RISK = 'RISK',
  AUDIT = 'AUDIT',
  BREACH = 'BREACH',
  CONSENT = 'CONSENT',
  DSAR = 'DSAR',
  VENDOR = 'VENDOR',
  CUSTOM = 'CUSTOM',
}

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  XLSX = 'XLSX',
  JSON = 'JSON',
}

export enum ReportDefinitionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

@Entity('report_definitions')
@Index(['tenantId', 'name'], { unique: true })
export class ReportDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: ReportType })
  type: ReportType;

  @Column({ type: 'enum', enum: ReportFormat, default: ReportFormat.PDF })
  format: ReportFormat;

  @Column({ type: 'jsonb', nullable: true })
  template: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  dataSources: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, any> | null;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'enum', enum: ReportDefinitionStatus, default: ReportDefinitionStatus.DRAFT })
  status: ReportDefinitionStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => ReportExecution, (execution) => execution.definition)
  executions: ReportExecution[];

  @OneToMany(() => ScheduledReport, (schedule) => schedule.definition)
  scheduledReports: ScheduledReport[];
}
