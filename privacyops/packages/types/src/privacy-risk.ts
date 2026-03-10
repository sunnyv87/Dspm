import type { UUID, ISODateString, AuditableEntity } from './common';

export enum RiskLevel { CRITICAL = 'critical', HIGH = 'high', MEDIUM = 'medium', LOW = 'low', NEGLIGIBLE = 'negligible' }

export enum RiskCategory {
  DATA_EXPOSURE = 'data_exposure', UNAUTHORIZED_ACCESS = 'unauthorized_access',
  COMPLIANCE_VIOLATION = 'compliance_violation', DATA_BREACH = 'data_breach',
  CONSENT_VIOLATION = 'consent_violation', RETENTION_VIOLATION = 'retention_violation',
  CROSS_BORDER_TRANSFER = 'cross_border_transfer', VENDOR_RISK = 'vendor_risk',
}

export enum AssessmentStatus { DRAFT = 'draft', IN_REVIEW = 'in_review', APPROVED = 'approved', REJECTED = 'rejected' }

export interface RiskAssessment extends AuditableEntity {
  title: string;
  description: string;
  category: RiskCategory;
  riskLevel: RiskLevel;
  status: AssessmentStatus;
  likelihood: number;
  impact: number;
  riskScore: number;
  mitigationPlan?: string;
  residualRiskLevel?: RiskLevel;
  reviewerId?: UUID;
  reviewedAt?: ISODateString;
  relatedAssetIds: UUID[];
  relatedProcessingActivityIds: UUID[];
}

export interface DPIA extends AuditableEntity {
  title: string;
  description: string;
  status: AssessmentStatus;
  processingActivityId: UUID;
  necessity: string;
  proportionality: string;
  risks: DPIARisk[];
  measures: DPIAMeasure[];
  dpoOpinion?: string;
  approvedBy?: UUID;
  approvedAt?: ISODateString;
}

export interface DPIARisk { description: string; likelihood: number; severity: number; mitigations: string[] }
export interface DPIAMeasure { description: string; implementationStatus: 'planned' | 'in_progress' | 'implemented' }
