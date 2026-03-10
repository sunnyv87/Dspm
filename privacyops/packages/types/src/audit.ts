import type { UUID, ISODateString } from './common';

export enum AuditAction {
  CREATE = 'create', READ = 'read', UPDATE = 'update', DELETE = 'delete',
  LOGIN = 'login', LOGOUT = 'logout', EXPORT = 'export', APPROVE = 'approve',
  REJECT = 'reject', ASSIGN = 'assign', ESCALATE = 'escalate',
}

export enum AuditResource {
  USER = 'user', ROLE = 'role', TENANT = 'tenant', DATA_SOURCE = 'data_source',
  DATA_ASSET = 'data_asset', CONSENT = 'consent', RIGHTS_REQUEST = 'rights_request',
  BREACH_INCIDENT = 'breach_incident', RISK_ASSESSMENT = 'risk_assessment',
  COMPLIANCE_CONTROL = 'compliance_control', RETENTION_POLICY = 'retention_policy',
  VENDOR = 'vendor', WORKFLOW = 'workflow', NOTIFICATION = 'notification', POLICY = 'policy',
}

export interface AuditEntry {
  id: UUID;
  tenantId: UUID;
  userId: UUID;
  action: AuditAction;
  resource: AuditResource;
  resourceId: UUID;
  changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> };
  ipAddress: string;
  userAgent: string;
  correlationId?: UUID;
  timestamp: ISODateString;
  metadata?: Record<string, unknown>;
}

export interface AuditSearchParams {
  tenantId: UUID;
  startDate?: ISODateString;
  endDate?: ISODateString;
  userId?: UUID;
  action?: AuditAction;
  resource?: AuditResource;
  resourceId?: UUID;
  search?: string;
  page?: number;
  pageSize?: number;
}
