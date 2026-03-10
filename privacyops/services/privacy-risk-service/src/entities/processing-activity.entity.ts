import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

export enum LawfulBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTEREST = 'vital_interest',
  PUBLIC_INTEREST = 'public_interest',
  LEGITIMATE_INTEREST = 'legitimate_interest',
}

export enum ProcessingActivityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_REVIEW = 'under_review',
  ARCHIVED = 'archived',
}

@Entity('processing_activities')
export class ProcessingActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  department: string;

  @Column({ type: 'text' })
  purpose: string;

  @Column({ type: 'enum', enum: LawfulBasis })
  lawfulBasis: LawfulBasis;

  @Column({ type: 'jsonb', default: [] })
  dataCategories: string[];

  @Column({ type: 'jsonb', nullable: true })
  dataSubjectCategories: string[];

  @Column({ type: 'jsonb', nullable: true })
  systems: string[];

  @Column({ type: 'jsonb', nullable: true })
  thirdParties: Record<string, any>[];

  @Column({ type: 'boolean', default: false })
  crossBorderTransfer: boolean;

  @Column({ type: 'jsonb', nullable: true })
  crossBorderDetails: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  automatedDecisionMaking: boolean;

  @Column({ type: 'int', nullable: true })
  retentionPeriodDays: number;

  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string;

  @Column({
    type: 'enum',
    enum: ProcessingActivityStatus,
    default: ProcessingActivityStatus.ACTIVE,
  })
  status: ProcessingActivityStatus;

  @Column({ type: 'boolean', default: false })
  dpiaRequired: boolean;

  @Column({ type: 'uuid', nullable: true })
  dpiaId: string;

  @Column({ type: 'jsonb', nullable: true })
  consentPurposeIds: string[];

  @Column({ type: 'jsonb', nullable: true })
  dataSourceIds: string[];

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
