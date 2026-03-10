import type { UUID, ISODateString, AuditableEntity } from './common';

export enum NotificationChannel { EMAIL = 'email', IN_APP = 'in_app', WEBHOOK = 'webhook', SLACK = 'slack', SMS = 'sms' }
export enum NotificationStatus { PENDING = 'pending', SENT = 'sent', DELIVERED = 'delivered', FAILED = 'failed', READ = 'read' }
export enum NotificationPriority { CRITICAL = 'critical', HIGH = 'high', MEDIUM = 'medium', LOW = 'low' }

export interface Notification extends AuditableEntity {
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  recipientId: UUID;
  recipientEmail?: string;
  subject: string;
  body: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  sentAt?: ISODateString;
  deliveredAt?: ISODateString;
  readAt?: ISODateString;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  relatedEntityType?: string;
  relatedEntityId?: UUID;
}

export interface NotificationPreference {
  userId: UUID;
  tenantId: UUID;
  channel: NotificationChannel;
  category: string;
  enabled: boolean;
}
