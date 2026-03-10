import type { UUID, ISODateString, AuditableEntity } from './common';

export enum ComplianceFramework {
  DPDP = 'dpdp', GDPR = 'gdpr', HIPAA = 'hipaa', PCI_DSS = 'pci_dss',
  SOC2 = 'soc2', ISO_27001 = 'iso_27001', CCPA = 'ccpa',
  RBI = 'rbi', SEBI = 'sebi', IRDAI = 'irdai', CUSTOM = 'custom',
}

export enum ControlStatus {
  COMPLIANT = 'compliant', NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant', NOT_ASSESSED = 'not_assessed',
  NOT_APPLICABLE = 'not_applicable',
}

export interface ComplianceControl extends AuditableEntity {
  framework: ComplianceFramework;
  controlId: string;
  title: string;
  description: string;
  category: string;
  status: ControlStatus;
  evidence?: string;
  lastAssessedAt?: ISODateString;
  nextAssessmentAt?: ISODateString;
  assigneeId?: UUID;
  automatedCheck: boolean;
  remediationGuidance?: string;
}

export interface ComplianceScore {
  framework: ComplianceFramework;
  overallScore: number;
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  partiallyCompliantControls: number;
  notAssessedControls: number;
  lastCalculatedAt: ISODateString;
}
