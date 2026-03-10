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
import { BreachIncident } from './breach-incident.entity';

export enum RecipientType {
  DPA = 'DPA',
  DATA_SUBJECT = 'DATA_SUBJECT',
  MANAGEMENT = 'MANAGEMENT',
  LEGAL = 'LEGAL',
  PROCESSOR = 'PROCESSOR',
  OTHER = 'OTHER',
}

export enum NotificationStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  LETTER = 'LETTER',
  PORTAL = 'PORTAL',
  API = 'API',
}

@Entity('breach_notifications')
@Index(['tenantId'])
@Index(['tenantId', 'incidentId'])
export class BreachNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  incidentId: string;

  @ManyToOne(() => BreachIncident, (incident) => incident.notifications)
  @JoinColumn({ name: 'incidentId' })
  incident: BreachIncident;

  @Column({ type: 'enum', enum: RecipientType })
  recipientType: RecipientType;

  @Column({ type: 'varchar', length: 255 })
  recipientName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recipientEmail: string;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.DRAFT })
  status: NotificationStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  templateName: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'enum', enum: NotificationChannel, default: NotificationChannel.EMAIL })
  channel: NotificationChannel;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
