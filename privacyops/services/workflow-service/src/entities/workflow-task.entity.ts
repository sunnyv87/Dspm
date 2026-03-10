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
import { WorkflowInstance } from './workflow-instance.entity';
import { ApprovalRecord } from './approval-record.entity';

export enum TaskType {
  MANUAL = 'MANUAL',
  APPROVAL = 'APPROVAL',
  REVIEW = 'REVIEW',
  DATA_COLLECTION = 'DATA_COLLECTION',
  NOTIFICATION = 'NOTIFICATION',
  AUTOMATED = 'AUTOMATED',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  FAILED = 'FAILED',
}

@Entity('workflow_tasks')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'assignedTo'])
export class WorkflowTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  instanceId: string;

  @ManyToOne(() => WorkflowInstance, (instance) => instance.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instanceId' })
  instance: WorkflowInstance;

  @Column({ type: 'varchar', length: 255 })
  stepId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskType, default: TaskType.MANUAL })
  type: TaskType;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedGroup: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  completedBy: string;

  @Column({ type: 'jsonb', default: {} })
  input: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  output: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => ApprovalRecord, (approval) => approval.task)
  approvals: ApprovalRecord[];
}
