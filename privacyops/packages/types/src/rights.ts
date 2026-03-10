import type { UUID, ISODateString, AuditableEntity } from './common';

export enum RightsRequestType {
  ACCESS = 'access', RECTIFICATION = 'rectification', ERASURE = 'erasure',
  PORTABILITY = 'portability', RESTRICTION = 'restriction', OBJECTION = 'objection',
  WITHDRAW_CONSENT = 'withdraw_consent', NOMINATION = 'nomination',
}

export enum RightsRequestStatus {
  SUBMITTED = 'submitted', VERIFIED = 'verified', IN_PROGRESS = 'in_progress',
  PENDING_APPROVAL = 'pending_approval', APPROVED = 'approved', REJECTED = 'rejected',
  COMPLETED = 'completed', CLOSED = 'closed',
}

export interface RightsRequest extends AuditableEntity {
  requestType: RightsRequestType;
  status: RightsRequestStatus;
  dataSubjectEmail: string;
  dataSubjectName: string;
  identityVerified: boolean;
  identityVerifiedAt?: ISODateString;
  description?: string;
  deadline: ISODateString;
  completedAt?: ISODateString;
  assigneeId?: UUID;
  affectedSystems: string[];
  response?: string;
  extensionGranted: boolean;
  extensionReason?: string;
  automatedActions: RightsAutomatedAction[];
}

export interface RightsAutomatedAction {
  dataSourceId: UUID;
  actionType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: Record<string, unknown>;
  executedAt?: ISODateString;
}
