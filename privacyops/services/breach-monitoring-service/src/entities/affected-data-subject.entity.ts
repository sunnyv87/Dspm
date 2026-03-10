import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BreachIncident } from './breach-incident.entity';

export enum SubjectType {
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
  PARTNER = 'PARTNER',
  PROSPECT = 'PROSPECT',
  OTHER = 'OTHER',
}

export enum RiskLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

@Entity('affected_data_subjects')
@Index(['tenantId'])
@Index(['tenantId', 'incidentId'])
export class AffectedDataSubject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  incidentId: string;

  @ManyToOne(() => BreachIncident, (incident) => incident.affectedSubjects)
  @JoinColumn({ name: 'incidentId' })
  incident: BreachIncident;

  @Column({ type: 'varchar', length: 500 })
  subjectIdentifier: string;

  @Column({ type: 'enum', enum: SubjectType })
  subjectType: SubjectType;

  @Column({ type: 'jsonb', default: [] })
  affectedDataCategories: string[];

  @Column({ type: 'boolean', default: false })
  notified: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  notifiedAt: Date;

  @Column({ type: 'enum', enum: RiskLevel })
  riskLevel: RiskLevel;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
