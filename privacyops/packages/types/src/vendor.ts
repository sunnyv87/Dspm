import type { UUID, ISODateString, AuditableEntity } from './common';

export enum VendorRiskLevel { CRITICAL = 'critical', HIGH = 'high', MEDIUM = 'medium', LOW = 'low' }
export enum VendorStatus { ACTIVE = 'active', UNDER_REVIEW = 'under_review', SUSPENDED = 'suspended', TERMINATED = 'terminated' }

export interface Vendor extends AuditableEntity {
  name: string;
  description?: string;
  contactEmail: string;
  contactName: string;
  website?: string;
  status: VendorStatus;
  riskLevel: VendorRiskLevel;
  dataProcessingAgreementUrl?: string;
  dpaSignedAt?: ISODateString;
  subProcessors: string[];
  dataCategories: string[];
  hostingLocations: string[];
  certifications: string[];
  lastAssessedAt?: ISODateString;
  nextAssessmentAt?: ISODateString;
  riskScore: number;
}

export interface VendorAssessment extends AuditableEntity {
  vendorId: UUID;
  assessmentType: string;
  score: number;
  findings: VendorFinding[];
  status: 'draft' | 'in_review' | 'completed';
  assessorId: UUID;
}

export interface VendorFinding {
  category: string;
  description: string;
  severity: VendorRiskLevel;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted';
}
