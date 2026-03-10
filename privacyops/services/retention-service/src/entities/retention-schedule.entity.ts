import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { RetentionPolicy } from './retention-policy.entity';
import { RetentionExecution } from './retention-execution.entity';

export enum ScheduleStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DISABLED = 'DISABLED',
}

@Entity('retention_schedules')
@Index(['tenantId', 'policyId'])
export class RetentionSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  policyId: string;

  @ManyToOne(() => RetentionPolicy, (policy) => policy.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'policyId' })
  policy: RetentionPolicy;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  cronExpression: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  nextRunAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastRunAt: Date | null;

  @Column({ type: 'enum', enum: ScheduleStatus, default: ScheduleStatus.ACTIVE })
  status: ScheduleStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => RetentionExecution, (execution) => execution.schedule)
  executions: RetentionExecution[];
}
