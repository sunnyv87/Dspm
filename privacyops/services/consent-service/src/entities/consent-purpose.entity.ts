import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PolicyVersion } from './policy-version.entity';
import { ConsentRecord } from './consent-record.entity';

export enum LegalBasis {
  CONSENT = 'consent',
  LEGITIMATE_INTEREST = 'legitimate_interest',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTEREST = 'vital_interest',
  PUBLIC_INTEREST = 'public_interest',
}

@Entity('consent_purposes')
@Index(['tenantId', 'slug'], { unique: true })
export class ConsentPurpose {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: LegalBasis })
  legalBasis: LegalBasis;

  @Column({ type: 'jsonb', default: [] })
  dataCategories: string[];

  @Column({ type: 'int', nullable: true })
  retentionPeriodDays: number | null;

  @Column({ type: 'boolean', default: false })
  isMandatory: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'uuid', nullable: true })
  previousVersionId: string | null;

  @ManyToOne(() => ConsentPurpose, { nullable: true })
  @JoinColumn({ name: 'previousVersionId' })
  previousVersion: ConsentPurpose | null;

  @Column({ type: 'jsonb', default: [] })
  regulatoryFrameworks: string[];

  @Column({ type: 'jsonb', default: [] })
  thirdPartyRecipients: string[];

  @Column({ type: 'jsonb', default: [] })
  crossBorderTransfers: Record<string, any>[];

  @Column({ type: 'jsonb', default: [] })
  processingActivityIds: string[];

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => PolicyVersion, (pv) => pv.purpose)
  policyVersions: PolicyVersion[];

  @OneToMany(() => ConsentRecord, (cr) => cr.purpose)
  consentRecords: ConsentRecord[];
}
