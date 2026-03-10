import type { UUID, ISODateString, AuditableEntity } from './common';

export enum RetentionAction { DELETE = 'delete', ARCHIVE = 'archive', ANONYMIZE = 'anonymize', REVIEW = 'review' }

export interface RetentionPolicy extends AuditableEntity {
  name: string;
  description: string;
  dataCategory: string;
  retentionPeriodDays: number;
  action: RetentionAction;
  legalBasis?: string;
  applicableFrameworks: string[];
  isActive: boolean;
  lastExecutedAt?: ISODateString;
  nextExecutionAt?: ISODateString;
  affectedAssetCount: number;
}

export interface RetentionExecution {
  id: UUID;
  policyId: UUID;
  tenantId: UUID;
  status: 'pending' | 'running' | 'completed' | 'failed';
  assetsProcessed: number;
  assetsTotal: number;
  startedAt: ISODateString;
  completedAt?: ISODateString;
  errors: string[];
}
