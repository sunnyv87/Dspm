import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReportDefinition, ReportFormat } from './report-definition.entity';

export enum ReportExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('report_executions')
@Index(['tenantId', 'definitionId'])
export class ReportExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  definitionId: string;

  @ManyToOne(() => ReportDefinition, (definition) => definition.executions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'definitionId' })
  definition: ReportDefinition;

  @Column({ type: 'enum', enum: ReportExecutionStatus, default: ReportExecutionStatus.PENDING })
  status: ReportExecutionStatus;

  @Column({ type: 'enum', enum: ReportFormat })
  format: ReportFormat;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  outputUrl: string | null;

  @Column({ type: 'int', nullable: true })
  fileSize: number | null;

  @Column({ type: 'uuid' })
  generatedBy: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  parameters: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
