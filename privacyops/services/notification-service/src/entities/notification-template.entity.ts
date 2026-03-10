import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notification_templates')
export class NotificationTemplateEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true }) tenantId: string;
  @Column({ unique: true }) templateKey: string;
  @Column() name: string;
  @Column() subject: string;
  @Column('text') bodyTemplate: string;
  @Column({ type: 'enum', enum: ['email', 'in_app', 'webhook', 'slack', 'sms'] }) channel: string;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
