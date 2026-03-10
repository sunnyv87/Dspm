import type { UUID, ISODateString, BaseEntity } from "./common";

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum TenantStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  PENDING_SETUP = "pending_setup",
  DEACTIVATED = "deactivated",
  TRIAL = "trial",
}

export enum TenantPlan {
  STARTER = "starter",
  PROFESSIONAL = "professional",
  ENTERPRISE = "enterprise",
  CUSTOM = "custom",
}

export enum TenantIsolationLevel {
  ROW = "row",
  SCHEMA = "schema",
  DATABASE = "database",
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Tenant extends BaseEntity {
  name: string;
  slug: string;
  domain?: string;
  status: TenantStatus;
  plan: TenantPlan;
  isolationLevel: TenantIsolationLevel;
  settings: TenantSettings;
  subscription: TenantSubscription;
  primaryContactId?: UUID;
  logoUrl?: string;
  timezone: string;
  defaultLocale: string;
  maxUsers: number;
  maxDataSources: number;
  createdBy: UUID;
}

export interface TenantSettings {
  enabledFrameworks: string[];
  defaultRightsRequestSlaHours: number;
  breachNotificationWindowHours: number;
  consentExpiryDays: number;
  dataRetentionCheckEnabled: boolean;
  mfaRequired: boolean;
  ipAllowlist?: string[];
  ssoEnabled: boolean;
  ssoProvider?: string;
  ssoMetadataUrl?: string;
  customBranding?: TenantBranding;
  webhookEndpoints?: WebhookEndpoint[];
}

export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  companyName: string;
}

export interface WebhookEndpoint {
  id: UUID;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: ISODateString;
}

export interface TenantSubscription {
  planId: TenantPlan;
  startDate: ISODateString;
  endDate?: ISODateString;
  trialEndsAt?: ISODateString;
  isTrialActive: boolean;
  billingCycleAnchor: ISODateString;
  cancelledAt?: ISODateString;
  externalSubscriptionId?: string;
}

export interface TenantUsage {
  tenantId: UUID;
  periodStart: ISODateString;
  periodEnd: ISODateString;
  activeUsers: number;
  dataSources: number;
  dataAssetsScanned: number;
  rightsRequestsProcessed: number;
  apiCallsCount: number;
  storageUsedBytes: number;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  domain?: string;
  plan: TenantPlan;
  timezone?: string;
  defaultLocale?: string;
  primaryContactEmail: string;
  primaryContactName: string;
}

export interface UpdateTenantRequest {
  name?: string;
  domain?: string;
  status?: TenantStatus;
  plan?: TenantPlan;
  settings?: Partial<TenantSettings>;
  timezone?: string;
  defaultLocale?: string;
  logoUrl?: string;
  maxUsers?: number;
  maxDataSources?: number;
}
