import type { UUID, ISODateString, AuditableEntity } from './common';

export enum LawfulBasis {
  CONSENT = 'consent', CONTRACT = 'contract', LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTEREST = 'vital_interest', PUBLIC_INTEREST = 'public_interest', LEGITIMATE_INTEREST = 'legitimate_interest',
}

export enum ProcessingStatus { ACTIVE = 'active', INACTIVE = 'inactive', UNDER_REVIEW = 'under_review' }

export interface ProcessingActivity extends AuditableEntity {
  name: string;
  description: string;
  purpose: string;
  lawfulBasis: LawfulBasis;
  status: ProcessingStatus;
  dataCategories: string[];
  dataSubjectCategories: string[];
  recipients: string[];
  crossBorderTransfers: CrossBorderTransfer[];
  retentionPeriodDays: number;
  automatedDecisionMaking: boolean;
  dpiaRequired: boolean;
  dpiaId?: UUID;
  responsibleOfficerId?: UUID;
  dataSourceIds: UUID[];
  thirdPartyProcessors: string[];
}

export interface CrossBorderTransfer {
  destinationCountry: string;
  safeguard: string;
  details?: string;
}
