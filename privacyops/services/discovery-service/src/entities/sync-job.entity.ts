import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DataSource } from './data-source.entity';

export enum SyncType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  METADATA_ONLY = 'metadata_only',
}

export enum SyncStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('discovery_sync_jobs')
@Index(['tenantId'])
export class SyncJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  dataSourceId: string;

  @Column({ type: 'enum', enum: SyncType })
  syncType: SyncType;

  @Column({ type: 'enum', enum: SyncStatus, default: SyncStatus.QUEUED })
  status: SyncStatus;

  @Column({ type: 'int', default: 0 })
  totalAssets: number;

  @Column({ type: 'int', default: 0 })
  processedAssets: number;

  @Column({ type: 'int', default: 0 })
  newAssets: number;

  @Column({ type: 'int', default: 0 })
  updatedAssets: number;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  @Column({ type: 'jsonb', nullable: true })
  errorDetails: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'uuid' })
  triggeredBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => DataSource, (ds) => ds.syncJobs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dataSourceId' })
  dataSource: DataSource;
}
