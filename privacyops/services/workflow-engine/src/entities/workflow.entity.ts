import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { WorkflowStepEntity } from './workflow-step.entity';

@Entity('workflows')
@Index(['tenantId', 'status'])
export class WorkflowEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') tenantId: string;
  @Column() name: string;
  @Column() type: string;
  @Column({ type: 'enum', enum: ['pending', 'active', 'completed', 'cancelled', 'failed'], default: 'pending' }) status: string;
  @Column({ default: 0 }) currentStepIndex: number;
  @Column({ type: 'jsonb', default: {} }) contextData: Record<string, unknown>;
  @Column('uuid') triggeredBy: string;
  @Column({ nullable: true }) completedAt: Date;
  @OneToMany(() => WorkflowStepEntity, step => step.workflow, { cascade: true, eager: true }) steps: WorkflowStepEntity[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
