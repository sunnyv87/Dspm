import type { UUID, ISODateString, ISODuration, AuditableEntity } from "./common";

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ConsentStatus {
  GRANTED = "granted",
  WITHDRAWN = "withdrawn",
  EXPIRED = "expired",
  PENDING = "pending",
  REFUSED = "refused",
}

export enum LegalBasis {
  CONSENT = "consent",
  LEGITIMATE_INTEREST = "legitimate_interest",
  CONTRACT = "contract",
  LEGAL_OBLIGATION = "legal_obligation",
  VITAL_INTEREST = "vital_interest",
  PUBLIC_INTEREST = "public_interest",
}

export enum ConsentCollectionMethod {
  WEB_FORM = "web_form",
  MOBILE_APP = "mobile_app",
  EMAIL = "email",
  PAPER = "paper",
  VERBAL = "verbal",
  API = "api",
  COOKIE_BANNER = "cookie_banner",
  DOUBLE_OPT_IN = "double_opt_in",
}

export enum DataCategory {
  PERSONAL_IDENTITY = "personal_identity",
  CONTACT_INFO = "contact_info",
  FINANCIAL = "financial",
  HEALTH = "health",
  BIOMETRIC = "biometric",
  GENETIC = "genetic",
  RACIAL_ETHNIC = "racial_ethnic",
  POLITICAL_OPINION = "political_opinion",
  RELIGIOUS_BELIEF = "religious_belief",
  SEXUAL_ORIENTATION = "sexual_orientation",
  TRADE_UNION = "trade_union",
  CRIMINAL_RECORD = "criminal_record",
  LOCATION = "location",
  BEHAVIORAL = "behavioral",
  DEVICE_IDENTIFIERS = "device_identifiers",
  BROWSING_HISTORY = "browsing_history",
  EMPLOYMENT = "employment",
  EDUCATION = "education",
  CHILDREN = "children",
  COMMUNICATION_CONTENT = "communication_content",
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ConsentPurpose extends AuditableEntity {
  name: string;
  slug: string;
  description: string;
  legalBasis: LegalBasis;
  dataCategories: DataCategory[];
  retentionPeriod: ISODuration;
  isActive: boolean;
  isMandatory: boolean;
  version: number;
  previousVersionId?: UUID;
  regulatoryFrameworks: string[];
  thirdPartyRecipients?: string[];
  crossBorderTransfers?: string[];
  processingActivityIds: UUID[];
}

export interface ConsentRecord extends AuditableEntity {
  dataSubjectId: UUID;
  dataSubjectEmail?: string;
  dataSubjectExternalId?: string;
  purposeId: UUID;
  purposeVersion: number;
  status: ConsentStatus;
  consentedAt?: ISODateString;
  withdrawnAt?: ISODateString;
  expiresAt?: ISODateString;
  collectionMethod: ConsentCollectionMethod;
  collectionContext?: string;
  ipAddress?: string;
  userAgent?: string;
  evidence: ConsentEvidence;
  granularity?: ConsentGranularity;
  parentConsentId?: UUID;
  source: string;
  isMinor: boolean;
  guardianConsentId?: UUID;
}

export interface ConsentEvidence {
  type: "signature" | "checkbox" | "verbal_recorded" | "document" | "api_request";
  reference: string;
  documentUrl?: string;
  rawPayload?: Record<string, unknown>;
  checksumSha256?: string;
  witnessId?: UUID;
}

export interface ConsentGranularity {
  allowedDataCategories?: DataCategory[];
  allowedProcessingTypes?: string[];
  allowedRetentionPeriod?: ISODuration;
  restrictions?: string[];
}

export interface ConsentPreference {
  dataSubjectId: UUID;
  tenantId: UUID;
  preferences: Record<string, ConsentPreferenceEntry>;
  lastUpdatedAt: ISODateString;
  preferenceHash: string;
}

export interface ConsentPreferenceEntry {
  purposeId: UUID;
  purposeName: string;
  status: ConsentStatus;
  grantedAt?: ISODateString;
  expiresAt?: ISODateString;
  granularity?: ConsentGranularity;
}

export interface ConsentStats {
  tenantId: UUID;
  totalRecords: number;
  byStatus: Record<ConsentStatus, number>;
  byPurpose: Array<{
    purposeId: UUID;
    purposeName: string;
    granted: number;
    withdrawn: number;
    expired: number;
  }>;
  complianceRate: number;
  periodStart: ISODateString;
  periodEnd: ISODateString;
}

// ─── Request/Response Types ──────────────────────────────────────────────────

export interface RecordConsentRequest {
  dataSubjectId: UUID;
  dataSubjectEmail?: string;
  purposeId: UUID;
  status: ConsentStatus.GRANTED | ConsentStatus.REFUSED;
  collectionMethod: ConsentCollectionMethod;
  collectionContext?: string;
  ipAddress?: string;
  userAgent?: string;
  evidence: ConsentEvidence;
  granularity?: ConsentGranularity;
  expiresAt?: ISODateString;
  isMinor?: boolean;
  guardianConsentId?: UUID;
}

export interface WithdrawConsentRequest {
  dataSubjectId: UUID;
  purposeId: UUID;
  reason?: string;
  ipAddress?: string;
}

export interface ConsentAuditTrail {
  consentId: UUID;
  entries: Array<{
    action: "granted" | "withdrawn" | "expired" | "updated" | "version_change";
    timestamp: ISODateString;
    previousStatus?: ConsentStatus;
    newStatus: ConsentStatus;
    actor: UUID;
    reason?: string;
    metadata?: Record<string, unknown>;
  }>;
}
