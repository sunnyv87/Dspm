import type { UUID, ISODateString, AuditableEntity } from "./common";

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  INVITED = "invited",
  LOCKED = "locked",
  PENDING_VERIFICATION = "pending_verification",
}

export enum SystemRole {
  SUPER_ADMIN = "super_admin",
  TENANT_ADMIN = "tenant_admin",
  PRIVACY_OFFICER = "privacy_officer",
  DPO = "dpo",
  COMPLIANCE_MANAGER = "compliance_manager",
  DATA_STEWARD = "data_steward",
  ANALYST = "analyst",
  AUDITOR = "auditor",
  VIEWER = "viewer",
}

export enum Permission {
  // Tenant management
  TENANT_READ = "tenant:read",
  TENANT_UPDATE = "tenant:update",
  TENANT_MANAGE_USERS = "tenant:manage_users",

  // Data assets
  DATA_ASSET_READ = "data_asset:read",
  DATA_ASSET_CREATE = "data_asset:create",
  DATA_ASSET_UPDATE = "data_asset:update",
  DATA_ASSET_DELETE = "data_asset:delete",
  DATA_ASSET_CLASSIFY = "data_asset:classify",

  // Consent management
  CONSENT_READ = "consent:read",
  CONSENT_MANAGE = "consent:manage",
  CONSENT_EXPORT = "consent:export",

  // Rights requests
  RIGHTS_READ = "rights:read",
  RIGHTS_PROCESS = "rights:process",
  RIGHTS_APPROVE = "rights:approve",

  // Risk & compliance
  RISK_READ = "risk:read",
  RISK_ASSESS = "risk:assess",
  RISK_APPROVE = "risk:approve",
  COMPLIANCE_READ = "compliance:read",
  COMPLIANCE_MANAGE = "compliance:manage",

  // Breach management
  BREACH_READ = "breach:read",
  BREACH_MANAGE = "breach:manage",
  BREACH_REPORT = "breach:report",

  // Vendor management
  VENDOR_READ = "vendor:read",
  VENDOR_MANAGE = "vendor:manage",
  VENDOR_ASSESS = "vendor:assess",

  // Retention policies
  RETENTION_READ = "retention:read",
  RETENTION_MANAGE = "retention:manage",

  // Audit
  AUDIT_READ = "audit:read",
  AUDIT_EXPORT = "audit:export",

  // Workflows
  WORKFLOW_READ = "workflow:read",
  WORKFLOW_MANAGE = "workflow:manage",
  WORKFLOW_EXECUTE = "workflow:execute",

  // Settings & config
  SETTINGS_READ = "settings:read",
  SETTINGS_MANAGE = "settings:manage",

  // Reports
  REPORT_READ = "report:read",
  REPORT_CREATE = "report:create",
  REPORT_EXPORT = "report:export",
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface User extends AuditableEntity {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  status: UserStatus;
  roles: UserRole[];
  avatarUrl?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  timezone?: string;
  locale?: string;
  lastLoginAt?: ISODateString;
  lastActiveAt?: ISODateString;
  failedLoginAttempts: number;
  lockedUntil?: ISODateString;
  passwordChangedAt?: ISODateString;
  mfaEnabled: boolean;
  mfaMethod?: MfaMethod;
  externalProviderId?: string;
  externalProviderType?: SsoProvider;
  invitedBy?: UUID;
  invitedAt?: ISODateString;
  acceptedInviteAt?: ISODateString;
  preferences: UserPreferences;
}

export enum MfaMethod {
  TOTP = "totp",
  SMS = "sms",
  EMAIL = "email",
  WEBAUTHN = "webauthn",
}

export enum SsoProvider {
  AZURE_AD = "azure_ad",
  OKTA = "okta",
  GOOGLE = "google",
  SAML = "saml",
  OIDC = "oidc",
}

export interface UserRole {
  id: UUID;
  userId: UUID;
  tenantId: UUID;
  role: SystemRole;
  permissions: Permission[];
  assignedAt: ISODateString;
  assignedBy: UUID;
  expiresAt?: ISODateString;
}

export interface RoleDefinition {
  role: SystemRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

export interface UserPreferences {
  notificationChannels: string[];
  emailDigestFrequency: "daily" | "weekly" | "none";
  dashboardLayout?: string;
  theme: "light" | "dark" | "system";
  language: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  roles: SystemRole[];
  department?: string;
  jobTitle?: string;
  sendInvite: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  timezone?: string;
  locale?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UserSummary {
  id: UUID;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: SystemRole[];
  status: UserStatus;
}
