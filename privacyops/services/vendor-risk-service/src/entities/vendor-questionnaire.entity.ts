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
import { Vendor } from './vendor.entity';
import { VendorAssessment } from './vendor-assessment.entity';

export enum QuestionnaireStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
}

@Entity('vendor_questionnaires')
@Index(['tenantId', 'vendorId'])
export class VendorQuestionnaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.questionnaires)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'uuid', nullable: true })
  assessmentId: string;

  @ManyToOne(() => VendorAssessment, (assessment) => assessment.questionnaires, { nullable: true })
  @JoinColumn({ name: 'assessmentId' })
  assessment: VendorAssessment;

  @Column({ type: 'varchar', length: 255 })
  templateName: string;

  @Column({ type: 'varchar', length: 50, default: '1.0' })
  version: string;

  @Column({ type: 'enum', enum: QuestionnaireStatus, default: QuestionnaireStatus.DRAFT })
  status: QuestionnaireStatus;

  @Column({ type: 'jsonb', default: [] })
  questions: Record<string, any>[];

  @Column({ type: 'jsonb', default: [] })
  responses: Record<string, any>[];

  @Column({ type: 'timestamp with time zone', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
