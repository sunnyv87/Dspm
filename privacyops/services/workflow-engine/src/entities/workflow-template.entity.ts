import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('workflow_templates')
export class WorkflowTemplateEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true }) tenantId: string;
  @Column() name: string;
  @Column({ nullable: true }) description: string;
  @Column() type: string;
  @Column({ type: 'jsonb' }) stepTemplates: Array<{
    index: number;
    name: string;
    type: string;
    config: Record<string, unknown>;
    dueDays?: number;
  }>;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
