import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { WorkflowInstance } from './workflow-instance.entity';

export enum WorkflowCategory {
  DSAR = 'DSAR',
  BREACH_RESPONSE = 'BREACH_RESPONSE',
  VENDOR_ONBOARDING = 'VENDOR_ONBOARDING',
  CONSENT_REVIEW = 'CONSENT_REVIEW',
  DATA_RETENTION = 'DATA_RETENTION',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  CUSTOM = 'CUSTOM',
}

export enum DefinitionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
  ARCHIVED = 'ARCHIVED',
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  nextSteps: string[];
}

export interface WorkflowTrigger {
  event: string;
  conditions: Record<string, any>;
}

@Entity('workflow_definitions')
@Index(['tenantId', 'name', 'version'], { unique: true })
export class WorkflowDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'enum', enum: WorkflowCategory, default: WorkflowCategory.CUSTOM })
  category: WorkflowCategory;

  @Column({ type: 'enum', enum: DefinitionStatus, default: DefinitionStatus.DRAFT })
  status: DefinitionStatus;

  @Column({ type: 'jsonb', default: [] })
  steps: WorkflowStep[];

  @Column({ type: 'jsonb', default: [] })
  triggers: WorkflowTrigger[];

  @Column({ type: 'int', nullable: true })
  slaHours: number;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => WorkflowInstance, (instance) => instance.definition)
  instances: WorkflowInstance[];
}
