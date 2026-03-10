import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProcessingActivity } from './processing-activity.entity';

export enum DpiaStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface DpiaRisk {
  description: string;
  likelihood: string;
  severity: string;
  mitigations: string[];
}

export interface DpiaMeasure {
  description: string;
  implementationStatus: 'planned' | 'in_progress' | 'implemented';
}

@Entity('dpia_records')
export class DpiaRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  processingActivityId: string;

  @ManyToOne(() => ProcessingActivity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'processingActivityId' })
  processingActivity: ProcessingActivity;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DpiaStatus,
    default: DpiaStatus.DRAFT,
  })
  status: DpiaStatus;

  @Column({ type: 'text', nullable: true })
  necessity: string;

  @Column({ type: 'text', nullable: true })
  proportionality: string;

  @Column({ type: 'jsonb', nullable: true })
  risks: DpiaRisk[];

  @Column({ type: 'jsonb', nullable: true })
  measures: DpiaMeasure[];

  @Column({ type: 'text', nullable: true })
  dpoOpinion: string;

  @Column({ type: 'timestamp', nullable: true })
  dpoApprovedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  rejectedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
