export interface Connector {
  id: string;
  org_id: string;
  name: string;
  connector_type: string;
  credential_type: string;
  status: "connected" | "failed" | "partial_access" | "disabled" | "pending";
  config: Record<string, any>;
  enabled: boolean;
  last_sync_at: string | null;
  last_error: string | null;
  created_at: string;
}

export interface ScanJob {
  id: string;
  connector_id: string;
  scan_type: string;
  status: "queued" | "running" | "paused" | "completed" | "failed" | "cancelled";
  progress_percent: number;
  total_objects: number;
  scanned_objects: number;
  errors_count: number;
  started_at: string | null;
  finished_at: string | null;
}

export interface Asset {
  id: string;
  name: string;
  asset_type: string;
  path: string | null;
  storage_location: string | null;
  geo_region: string | null;
  environment: string | null;
  sensitive_data_count: number;
  risk_score: number | null;
  exposure_status: "private" | "internal" | "external_shared" | "public";
  encryption_status: string;
  business_owner: string | null;
  technical_owner: string | null;
}

export interface Alert {
  id: string;
  alert_type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  status: "open" | "in_progress" | "resolved" | "accepted_risk" | "suppressed";
  title: string;
  description: string | null;
  asset_id: string | null;
  assigned_to: string | null;
  remediation_recommendation: string | null;
  created_at: string;
}

export interface RiskSummary {
  total_scored_assets: number;
  average_risk_score: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

export interface ExecutiveSummary {
  total_assets_scanned: number;
  sensitive_assets_count: number;
  critical_risk_assets: number;
  publicly_exposed_sensitive: number;
  top_risky_stores: { name: string; risk_score: number }[];
  alerts_by_severity: Record<string, number>;
}

export interface PolicyViolation {
  id: string;
  policy_rule_id: string;
  asset_id: string | null;
  severity: string;
  status: string;
  description: string | null;
  detected_at: string;
}

// ============================================
// PrivacyOps Types
// ============================================

export interface ConsentRecord {
  id: string;
  data_subject_id: string;
  purpose: string;
  legal_basis: string;
  status: "active" | "revoked" | "expired";
  granted_at: string;
  expires_at: string | null;
  revoked_at: string | null;
}

export interface DSARRequest {
  id: string;
  request_type: "access" | "deletion" | "rectification" | "portability" | "objection";
  status: "pending" | "in_progress" | "completed" | "rejected";
  data_subject_email: string;
  submitted_at: string;
  due_date: string;
  completed_at: string | null;
  assigned_to: string | null;
}

export interface BreachIncident {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "contained" | "resolved" | "closed";
  affected_records: number;
  detected_at: string;
  reported_at: string | null;
  resolved_at: string | null;
  description: string | null;
}

export interface Vendor {
  id: string;
  name: string;
  risk_level: "critical" | "high" | "medium" | "low";
  category: string;
  data_types_shared: string[];
  last_assessment_date: string | null;
  next_assessment_date: string | null;
  compliance_status: "compliant" | "non_compliant" | "pending_review";
  contract_expiry: string | null;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  data_category: string;
  retention_period_days: number;
  status: "active" | "expired" | "overdue";
  assets_count: number;
  last_applied: string | null;
  next_review: string | null;
}

export interface WorkflowInstance {
  id: string;
  template_name: string;
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed";
  initiated_by: string;
  assigned_to: string | null;
  created_at: string;
  completed_at: string | null;
  context: string | null;
}

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  details: string | null;
  ip_address: string | null;
}

export interface PrivacyOverviewSummary {
  totalAssets: number;
  newAssets: number;
  classifiedAssets: number;
  pendingClassification: number;
  activeConsents: number;
  expiredConsents: number;
  openBreaches: number;
  totalBreaches: number;
  riskScore: number;
  highRisks: number;
  highRiskVendors: number;
  totalVendors: number;
  complianceScore: number;
  complianceGaps: number;
  pendingRequests: number;
  totalRequests: number;
  retentionOverdue: number;
  retentionExpiringSoon: number;
  generatedAt: string;
}
