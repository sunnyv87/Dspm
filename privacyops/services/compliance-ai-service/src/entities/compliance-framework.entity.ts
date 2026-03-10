import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ComplianceScan } from './compliance-scan.entity';
import { ComplianceFinding } from './compliance-finding.entity';

export enum FrameworkStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

@Entity('compliance_frameworks')
@Index(['tenantId', 'name'], { unique: true })
export class ComplianceFramework {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  version: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: FrameworkStatus, default: FrameworkStatus.DRAFT })
  status: FrameworkStatus;

  @Column({ type: 'jsonb', default: [] })
  controls: {
    id: string;
    name: string;
    description: string;
    category: string;
  }[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => ComplianceScan, (scan) => scan.framework)
  scans: ComplianceScan[];

  @OneToMany(() => ComplianceFinding, (finding) => finding.framework)
  findings: ComplianceFinding[];
}
