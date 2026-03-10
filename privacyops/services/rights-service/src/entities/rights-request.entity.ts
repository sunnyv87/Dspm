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
import { DataSubject } from './data-subject.entity';
import { RightsTask } from './rights-task.entity';

export enum RequestType {
  ACCESS = 'ACCESS',
  RECTIFICATION = 'RECTIFICATION',
  ERASURE = 'ERASURE',
  PORTABILITY = 'PORTABILITY',
  RESTRICTION = 'RESTRICTION',
  OBJECTION = 'OBJECTION',
  AUTOMATED_DECISION = 'AUTOMATED_DECISION',
}

export enum RequestStatus {
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum RequestPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

@Entity('rights_requests')
@Index(['tenantId', 'subjectId'])
@Index(['tenantId', 'status'])
export class RightsRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  subjectId: string;

  @ManyToOne(() => DataSubject, (subject) => subject.requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectId' })
  subject: DataSubject;

  @Column({ type: 'enum', enum: RequestType })
  type: RequestType;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.SUBMITTED })
  status: RequestStatus;

  @Column({ type: 'enum', enum: RequestPriority, default: RequestPriority.MEDIUM })
  priority: RequestPriority;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamp with time zone' })
  requestedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationMethod: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  regulatoryFramework: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => RightsTask, (task) => task.request)
  tasks: RightsTask[];
}
