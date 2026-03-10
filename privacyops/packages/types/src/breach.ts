import type { UUID, ISODateString, AuditableEntity } from './common';

export enum BreachSeverity { CRITICAL = 'critical', HIGH = 'high', MEDIUM = 'medium', LOW = 'low' }
export enum BreachStatus {
  DETECTED = 'detected', INVESTIGATING = 'investigating', CONTAINED = 'contained',
  ERADICATED = 'eradicated', RECOVERED = 'recovered', CLOSED = 'closed', FALSE_POSITIVE = 'false_positive',
}
export enum BreachNotificationStatus {
  NOT_REQUIRED = 'not_required', PENDING = 'pending', NOTIFIED = 'notified', ACKNOWLEDGED = 'acknowledged',
}

export interface BreachIncident extends AuditableEntity {
  title: string;
  description: string;
  severity: BreachSeverity;
  status: BreachStatus;
  detectedAt: ISODateString;
  containedAt?: ISODateString;
  resolvedAt?: ISODateString;
  affectedDataSubjectCount?: number;
  affectedAssetIds: UUID[];
  dataCategories: string[];
  rootCause?: string;
  impactAssessment?: string;
  remediationSteps: string[];
  regulatoryNotification: BreachNotificationStatus;
  dpaNotifiedAt?: ISODateString;
  dataSubjectsNotifiedAt?: ISODateString;
  leadInvestigatorId?: UUID;
  timeline: BreachTimelineEntry[];
}

export interface BreachTimelineEntry {
  timestamp: ISODateString;
  action: string;
  performedBy: UUID;
  notes?: string;
}
