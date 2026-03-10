import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { VendorAssessment } from './vendor-assessment.entity';
import { VendorQuestionnaire } from './vendor-questionnaire.entity';
import { RiskFinding } from './risk-finding.entity';

export enum VendorCategory {
  CLOUD_PROVIDER = 'CLOUD_PROVIDER',
  SAAS = 'SAAS',
  DATA_PROCESSOR = 'DATA_PROCESSOR',
  DATA_CONTROLLER = 'DATA_CONTROLLER',
  SUBPROCESSOR = 'SUBPROCESSOR',
  CONSULTING = 'CONSULTING',
  OTHER = 'OTHER',
}

export enum RiskLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  UNKNOWN = 'UNKNOWN',
}

export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ONBOARDING = 'ONBOARDING',
  OFFBOARDED = 'OFFBOARDED',
}

@Entity('vendors')
@Index(['tenantId', 'name'], { unique: true })
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactName: string;

  @Column({ type: 'enum', enum: VendorCategory, default: VendorCategory.OTHER })
  category: VendorCategory;

  @Column({ type: 'enum', enum: RiskLevel, default: RiskLevel.UNKNOWN })
  riskLevel: RiskLevel;

  @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.ONBOARDING })
  status: VendorStatus;

  @Column({ type: 'boolean', default: false })
  dataProcessingAgreement: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastAssessmentDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  nextAssessmentDate: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => VendorAssessment, (assessment) => assessment.vendor)
  assessments: VendorAssessment[];

  @OneToMany(() => VendorQuestionnaire, (questionnaire) => questionnaire.vendor)
  questionnaires: VendorQuestionnaire[];

  @OneToMany(() => RiskFinding, (finding) => finding.vendor)
  findings: RiskFinding[];
}
