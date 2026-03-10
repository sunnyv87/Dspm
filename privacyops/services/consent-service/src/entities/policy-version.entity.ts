import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ConsentPurpose } from './consent-purpose.entity';
import { ConsentRecord } from './consent-record.entity';

@Entity('policy_versions')
@Index(['tenantId', 'purposeId', 'version'], { unique: true })
export class PolicyVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  purposeId: string;

  @ManyToOne(() => ConsentPurpose, (purpose) => purpose.policyVersions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purposeId' })
  purpose: ConsentPurpose;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  contentMarkdown: string;

  @Column({ type: 'text', nullable: true })
  contentHtml: string | null;

  @Column({ type: 'timestamp with time zone' })
  effectiveFrom: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  effectiveTo: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @OneToMany(() => ConsentRecord, (cr) => cr.policyVersion)
  consentRecords: ConsentRecord[];
}
