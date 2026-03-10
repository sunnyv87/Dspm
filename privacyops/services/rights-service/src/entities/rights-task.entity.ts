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
import { RightsRequest } from './rights-request.entity';

export enum TaskType {
  VERIFICATION = 'VERIFICATION',
  DATA_COLLECTION = 'DATA_COLLECTION',
  DATA_DELETION = 'DATA_DELETION',
  DATA_EXPORT = 'DATA_EXPORT',
  REVIEW = 'REVIEW',
  NOTIFICATION = 'NOTIFICATION',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

@Entity('rights_tasks')
@Index(['tenantId', 'requestId'])
export class RightsTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  requestId: string;

  @ManyToOne(() => RightsRequest, (request) => request.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: RightsRequest;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: TaskType })
  type: TaskType;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  completedBy: string | null;

  @Column({ type: 'jsonb', nullable: true })
  output: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
