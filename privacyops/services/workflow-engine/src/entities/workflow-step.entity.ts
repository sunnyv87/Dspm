import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { WorkflowEntity } from './workflow.entity';

@Entity('workflow_steps')
export class WorkflowStepEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') workflowId: string;
  @Column() index: number;
  @Column() name: string;
  @Column({ type: 'enum', enum: ['approval', 'task', 'notification', 'automated', 'condition'] }) type: string;
  @Column({ type: 'enum', enum: ['pending', 'in_progress', 'completed', 'skipped', 'failed'], default: 'pending' }) status: string;
  @Column({ type: 'uuid', nullable: true }) assigneeId: string;
  @Column({ type: 'jsonb', default: {} }) config: Record<string, unknown>;
  @Column({ type: 'jsonb', nullable: true }) result: Record<string, unknown>;
  @Column({ nullable: true }) startedAt: Date;
  @Column({ nullable: true }) completedAt: Date;
  @Column({ nullable: true }) dueAt: Date;
  @ManyToOne(() => WorkflowEntity, wf => wf.steps) @JoinColumn({ name: 'workflowId' }) workflow: WorkflowEntity;
  @CreateDateColumn() createdAt: Date;
}
