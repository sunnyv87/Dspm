import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkflowTask } from './workflow-task.entity';
import { WorkflowInstance } from './workflow-instance.entity';

export enum ApprovalDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DEFERRED = 'DEFERRED',
}

@Entity('approval_records')
@Index(['tenantId', 'taskId'])
@Index(['tenantId', 'approverId'])
export class ApprovalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  taskId: string;

  @ManyToOne(() => WorkflowTask, (task) => task.approvals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: WorkflowTask;

  @Column({ type: 'uuid' })
  instanceId: string;

  @ManyToOne(() => WorkflowInstance, (instance) => instance.approvals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instanceId' })
  instance: WorkflowInstance;

  @Column({ type: 'uuid' })
  approverId: string;

  @Column({ type: 'varchar', length: 255 })
  approverEmail: string;

  @Column({ type: 'enum', enum: ApprovalDecision })
  decision: ApprovalDecision;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, any>;

  @Column({ type: 'timestamp with time zone', nullable: true })
  decidedAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
