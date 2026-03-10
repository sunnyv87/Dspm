import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('notification_preferences')
@Unique(['userId', 'tenantId', 'channel', 'category'])
export class NotificationPreferenceEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') userId: string;
  @Column('uuid') tenantId: string;
  @Column({ type: 'enum', enum: ['email', 'in_app', 'webhook', 'slack', 'sms'] }) channel: string;
  @Column() category: string;
  @Column({ default: true }) enabled: boolean;
}
