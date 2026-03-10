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

export enum TimelineEventType {
  DETECTION = 'DETECTION',
  INVESTIGATION_START = 'INVESTIGATION_START',
  EVIDENCE_COLLECTED = 'EVIDENCE_COLLECTED',
  CONTAINMENT = 'CONTAINMENT',
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
  REGULATORY_FILING = 'REGULATORY_FILING',
  RESOLUTION = 'RESOLUTION',
  NOTE = 'NOTE',
}

@Entity('breach_timeline')
@Index(['tenantId'])
@Index(['tenantId', 'incidentId'])
export class BreachTimeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  incidentId: string;

  @ManyToOne(() => BreachIncident, (incident) => incident.timelineEntries)
  @JoinColumn({ name: 'incidentId' })
  incident: BreachIncident;

  @Column({ type: 'enum', enum: TimelineEventType })
  eventType: TimelineEventType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  performedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Record<string, any>[];

  @Column({ type: 'timestamp with time zone' })
  occurredAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
