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
import { ClassificationPolicy } from './classification-policy.entity';

export enum ClassificationSource {
  RULE = 'rule',
  DSPM = 'dspm',
  AI = 'ai',
  MANUAL = 'manual',
}

@Entity('classification_tags')
@Index(['tenantId', 'assetId'])
@Index(['tenantId', 'label'])
@Index(['tenantId', 'regulationTag'])
@Index(['tenantId', 'source'])
export class ClassificationTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  @Index()
  assetId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  assetName: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  regulationTag: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  confidenceScore: number;

  @Column({
    type: 'enum',
    enum: ClassificationSource,
    default: ClassificationSource.RULE,
  })
  source: ClassificationSource;

  @Column({ type: 'uuid', nullable: true })
  policyId: string;

  @ManyToOne(() => ClassificationPolicy, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'policyId' })
  policy: ClassificationPolicy;

  @Column({ type: 'varchar', length: 255, nullable: true })
  previousLabel: string;

  @Column({ type: 'uuid', nullable: true })
  reviewerId: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
