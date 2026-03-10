import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClassificationTag } from './classification-tag.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  OVERRIDDEN = 'overridden',
}

@Entity('classification_review_queue')
@Index(['tenantId', 'status'])
export class ClassificationReviewItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  classificationTagId: string;

  @ManyToOne(() => ClassificationTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classificationTagId' })
  classificationTag: ClassificationTag;

  @Column({ type: 'uuid' })
  assetId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  assetName: string;

  @Column({ type: 'varchar', length: 255 })
  currentLabel: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  suggestedLabel: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @Column({ type: 'uuid', nullable: true })
  reviewerId: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
