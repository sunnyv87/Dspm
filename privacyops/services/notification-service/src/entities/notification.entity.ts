import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('notifications')
@Index(['tenantId', 'recipientId'])
@Index(['tenantId', 'status'])
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') tenantId: string;
  @Column({ type: 'enum', enum: ['email', 'in_app', 'webhook', 'slack', 'sms'] }) channel: string;
  @Column({ type: 'enum', enum: ['pending', 'sent', 'delivered', 'failed', 'read'], default: 'pending' }) status: string;
  @Column({ type: 'enum', enum: ['critical', 'high', 'medium', 'low'], default: 'medium' }) priority: string;
  @Column('uuid') recipientId: string;
  @Column({ nullable: true }) recipientEmail: string;
  @Column() subject: string;
  @Column('text') body: string;
  @Column({ nullable: true }) templateId: string;
  @Column({ type: 'jsonb', nullable: true }) templateData: Record<string, unknown>;
  @Column({ nullable: true }) sentAt: Date;
  @Column({ nullable: true }) deliveredAt: Date;
  @Column({ nullable: true }) readAt: Date;
  @Column({ nullable: true }) failureReason: string;
  @Column({ default: 0 }) retryCount: number;
  @Column({ default: 3 }) maxRetries: number;
  @Column({ nullable: true }) relatedEntityType: string;
  @Column({ type: 'uuid', nullable: true }) relatedEntityId: string;
  @CreateDateColumn() createdAt: Date;
}
