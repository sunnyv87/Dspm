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
import { WorkflowDefinition } from './workflow-definition.entity';
import { WorkflowTask } from './workflow-task.entity';
import { ApprovalRecord } from './approval-record.entity';

export enum InstanceStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum InstancePriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

@Entity('workflow_instances')
@Index(['tenantId', 'status'])
export class WorkflowInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  definitionId: string;

  @ManyToOne(() => WorkflowDefinition, (def) => def.instances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'definitionId' })
  definition: WorkflowDefinition;

  @Column({ type: 'enum', enum: InstanceStatus, default: InstanceStatus.PENDING })
  status: InstanceStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  currentStepId: string;

  @Column({ type: 'enum', enum: InstancePriority, default: InstancePriority.MEDIUM })
  priority: InstancePriority;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dueDate: Date;

  @Column({ type: 'jsonb', default: {} })
  context: Record<string, any>;

  @Column({ type: 'uuid' })
  initiatedBy: string;

  @Column({ type: 'uuid', nullable: true })
  parentInstanceId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => WorkflowTask, (task) => task.instance)
  tasks: WorkflowTask[];

  @OneToMany(() => ApprovalRecord, (approval) => approval.instance)
  approvals: ApprovalRecord[];
}
