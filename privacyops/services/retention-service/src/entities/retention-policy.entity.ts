import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { RetentionSchedule } from './retention-schedule.entity';
import { RetentionExecution } from './retention-execution.entity';

export enum RetentionAction {
  DELETE = 'DELETE',
  ARCHIVE = 'ARCHIVE',
  ANONYMIZE = 'ANONYMIZE',
}

export enum RetentionPolicyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

@Entity('retention_policies')
@Index(['tenantId', 'name'], { unique: true })
export class RetentionPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255 })
  dataCategory: string;

  @Column({ type: 'int' })
  retentionPeriodDays: number;

  @Column({ type: 'enum', enum: RetentionAction })
  action: RetentionAction;

  @Column({ type: 'enum', enum: RetentionPolicyStatus, default: RetentionPolicyStatus.DRAFT })
  status: RetentionPolicyStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  legalBasis: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  regulatoryFramework: string | null;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => RetentionSchedule, (schedule) => schedule.policy)
  schedules: RetentionSchedule[];

  @OneToMany(() => RetentionExecution, (execution) => execution.policy)
  executions: RetentionExecution[];
}
