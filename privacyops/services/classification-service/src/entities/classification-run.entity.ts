import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClassificationPolicy } from './classification-policy.entity';

export enum RunStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('classification_runs')
export class ClassificationRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  policyId: string;

  @ManyToOne(() => ClassificationPolicy, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'policyId' })
  policy: ClassificationPolicy;

  @Column({
    type: 'enum',
    enum: RunStatus,
    default: RunStatus.QUEUED,
  })
  status: RunStatus;

  @Column({ type: 'int', default: 0 })
  totalAssets: number;

  @Column({ type: 'int', default: 0 })
  processedAssets: number;

  @Column({ type: 'int', default: 0 })
  newTags: number;

  @Column({ type: 'int', default: 0 })
  updatedTags: number;

  @Column({ type: 'int', default: 0 })
  errors: number;

  @Column({ type: 'uuid' })
  triggeredBy: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
