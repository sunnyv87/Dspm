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
import { ConsentPurpose } from './consent-purpose.entity';
import { PolicyVersion } from './policy-version.entity';

export enum ConsentStatus {
  GRANTED = 'granted',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
  PENDING = 'pending',
  REFUSED = 'refused',
}

export enum CollectionMethod {
  WEB_FORM = 'web_form',
  MOBILE_APP = 'mobile_app',
  EMAIL = 'email',
  PAPER = 'paper',
  VERBAL = 'verbal',
  API = 'api',
  COOKIE_BANNER = 'cookie_banner',
  DOUBLE_OPT_IN = 'double_opt_in',
}

@Entity('consent_records')
@Index(['tenantId', 'dataSubjectId'])
@Index(['tenantId', 'purposeId'])
@Index(['tenantId', 'status'])
export class ConsentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 500 })
  @Index()
  dataSubjectId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  dataSubjectEmail: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  dataSubjectExternalId: string | null;

  @Column({ type: 'uuid' })
  purposeId: string;

  @ManyToOne(() => ConsentPurpose, (purpose) => purpose.consentRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purposeId' })
  purpose: ConsentPurpose;

  @Column({ type: 'uuid' })
  policyVersionId: string;

  @ManyToOne(() => PolicyVersion, (pv) => pv.consentRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'policyVersionId' })
  policyVersion: PolicyVersion;

  @Column({ type: 'enum', enum: ConsentStatus })
  status: ConsentStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  consentedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  withdrawnAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'enum', enum: CollectionMethod })
  collectionMethod: CollectionMethod;

  @Column({ type: 'jsonb', nullable: true })
  collectionContext: Record<string, any> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'jsonb', nullable: true })
  deviceInfo: Record<string, any> | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  proofHash: string | null;

  @Column({ type: 'jsonb', nullable: true })
  granularity: Record<string, any> | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string | null;

  @Column({ type: 'boolean', default: false })
  isMinor: boolean;

  @Column({ type: 'uuid', nullable: true })
  guardianConsentId: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
