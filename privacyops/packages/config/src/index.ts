import { z } from "zod";

// ─── Database Configuration ───────────────────────────────────────────────────

const DatabaseConfigSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().positive().default(5432),
  username: z.string().min(1),
  password: z.string().min(1),
  database: z.string().min(1),
  ssl: z.coerce.boolean().default(false),
  poolMin: z.coerce.number().int().nonnegative().default(2),
  poolMax: z.coerce.number().int().positive().default(10),
  url: z.string().url().optional(),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

// ─── Redis Configuration ──────────────────────────────────────────────────────

const RedisConfigSchema = z.object({
  host: z.string().min(1).default("localhost"),
  port: z.coerce.number().int().positive().default(6379),
  password: z.string().optional(),
  db: z.coerce.number().int().nonnegative().default(0),
  tls: z.coerce.boolean().default(false),
  url: z.string().url().optional(),
  keyPrefix: z.string().default("privacyops:"),
});

export type RedisConfig = z.infer<typeof RedisConfigSchema>;

// ─── Auth / JWT Configuration ─────────────────────────────────────────────────

const AuthConfigSchema = z.object({
  jwtSecret: z.string().min(32),
  jwtAccessExpiresIn: z.string().default("15m"),
  jwtRefreshExpiresIn: z.string().default("7d"),
  bcryptRounds: z.coerce.number().int().min(10).max(14).default(12),
  mfaEnabled: z.coerce.boolean().default(true),
  sessionTimeout: z.coerce.number().int().positive().default(3600),
  maxFailedAttempts: z.coerce.number().int().positive().default(5),
  lockoutDuration: z.coerce.number().int().positive().default(900),
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

// ─── Tenant Isolation ─────────────────────────────────────────────────────────

const TenantIsolationMode = z.enum(["row", "schema", "database"]);
export type TenantIsolationMode = z.infer<typeof TenantIsolationMode>;

const TenantConfigSchema = z.object({
  isolationMode: TenantIsolationMode.default("row"),
  headerName: z.string().default("x-tenant-id"),
  maxTenantsPerInstance: z.coerce.number().int().positive().default(1000),
});

export type TenantConfig = z.infer<typeof TenantConfigSchema>;

// ─── DSPM Integration ─────────────────────────────────────────────────────────

const DspmConfigSchema = z.object({
  apiUrl: z.string().url(),
  apiKey: z.string().min(1),
  syncInterval: z.coerce.number().int().positive().default(300),
  batchSize: z.coerce.number().int().positive().default(100),
  timeoutMs: z.coerce.number().int().positive().default(30000),
  retryAttempts: z.coerce.number().int().nonnegative().default(3),
  retryDelayMs: z.coerce.number().int().positive().default(1000),
});

export type DspmConfig = z.infer<typeof DspmConfigSchema>;

// ─── Email / Notifications ────────────────────────────────────────────────────

const EmailConfigSchema = z.object({
  provider: z.enum(["smtp", "ses", "sendgrid"]).default("smtp"),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().int().positive().default(587),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  fromAddress: z.string().email().default("noreply@privacyops.techd.com"),
  fromName: z.string().default("TechD PrivacyOps"),
});

export type EmailConfig = z.infer<typeof EmailConfigSchema>;

// ─── Compliance Settings ──────────────────────────────────────────────────────

const ComplianceConfigSchema = z.object({
  rightsRequestSlaHours: z.coerce.number().int().positive().default(720),
  breachNotificationHours: z.coerce.number().int().positive().default(72),
  consentExpiryDays: z.coerce.number().int().positive().default(365),
  auditRetentionDays: z.coerce.number().int().positive().default(2555),
  dataRetentionCheckInterval: z.coerce.number().int().positive().default(86400),
});

export type ComplianceConfig = z.infer<typeof ComplianceConfigSchema>;

// ─── Application Configuration ────────────────────────────────────────────────

const AppConfigSchema = z.object({
  name: z.string().default("TechD PrivacyOps"),
  env: z.enum(["development", "staging", "production", "test"]).default("development"),
  port: z.coerce.number().int().positive().default(3000),
  apiPrefix: z.string().default("/api/v1"),
  corsOrigins: z
    .string()
    .transform((val) => val.split(",").map((s) => s.trim()))
    .default("http://localhost:3000"),
  logLevel: z.enum(["error", "warn", "info", "debug", "verbose"]).default("info"),
  rateLimitWindowMs: z.coerce.number().int().positive().default(60000),
  rateLimitMax: z.coerce.number().int().positive().default(100),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

// ─── Root Configuration ───────────────────────────────────────────────────────

export interface PrivacyOpsConfig {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  auth: AuthConfig;
  tenant: TenantConfig;
  dspm: DspmConfig;
  email: EmailConfig;
  compliance: ComplianceConfig;
}

// ─── Config Loader ────────────────────────────────────────────────────────────

function loadFromEnv<T extends z.ZodType>(
  schema: T,
  envMapping: Record<string, string>,
): z.infer<T> {
  const raw: Record<string, string | undefined> = {};
  for (const [key, envKey] of Object.entries(envMapping)) {
    raw[key] = process.env[envKey];
  }
  return schema.parse(raw);
}

export function loadConfig(): PrivacyOpsConfig {
  const app = loadFromEnv(AppConfigSchema, {
    name: "APP_NAME",
    env: "NODE_ENV",
    port: "PORT",
    apiPrefix: "API_PREFIX",
    corsOrigins: "CORS_ORIGINS",
    logLevel: "LOG_LEVEL",
    rateLimitWindowMs: "RATE_LIMIT_WINDOW_MS",
    rateLimitMax: "RATE_LIMIT_MAX",
  });

  const database = loadFromEnv(DatabaseConfigSchema, {
    host: "DB_HOST",
    port: "DB_PORT",
    username: "DB_USERNAME",
    password: "DB_PASSWORD",
    database: "DB_DATABASE",
    ssl: "DB_SSL",
    poolMin: "DB_POOL_MIN",
    poolMax: "DB_POOL_MAX",
    url: "DATABASE_URL",
  });

  const redis = loadFromEnv(RedisConfigSchema, {
    host: "REDIS_HOST",
    port: "REDIS_PORT",
    password: "REDIS_PASSWORD",
    db: "REDIS_DB",
    tls: "REDIS_TLS",
    url: "REDIS_URL",
    keyPrefix: "REDIS_KEY_PREFIX",
  });

  const auth = loadFromEnv(AuthConfigSchema, {
    jwtSecret: "JWT_SECRET",
    jwtAccessExpiresIn: "JWT_ACCESS_EXPIRES_IN",
    jwtRefreshExpiresIn: "JWT_REFRESH_EXPIRES_IN",
    bcryptRounds: "BCRYPT_ROUNDS",
    mfaEnabled: "MFA_ENABLED",
    sessionTimeout: "SESSION_TIMEOUT",
    maxFailedAttempts: "AUTH_MAX_FAILED_ATTEMPTS",
    lockoutDuration: "AUTH_LOCKOUT_DURATION",
  });

  const tenant = loadFromEnv(TenantConfigSchema, {
    isolationMode: "TENANT_ISOLATION_MODE",
    headerName: "TENANT_HEADER_NAME",
    maxTenantsPerInstance: "MAX_TENANTS_PER_INSTANCE",
  });

  const dspm = loadFromEnv(DspmConfigSchema, {
    apiUrl: "DSPM_API_URL",
    apiKey: "DSPM_API_KEY",
    syncInterval: "DSPM_SYNC_INTERVAL",
    batchSize: "DSPM_BATCH_SIZE",
    timeoutMs: "DSPM_TIMEOUT_MS",
    retryAttempts: "DSPM_RETRY_ATTEMPTS",
    retryDelayMs: "DSPM_RETRY_DELAY_MS",
  });

  const email = loadFromEnv(EmailConfigSchema, {
    provider: "EMAIL_PROVIDER",
    smtpHost: "SMTP_HOST",
    smtpPort: "SMTP_PORT",
    smtpUser: "SMTP_USER",
    smtpPassword: "SMTP_PASSWORD",
    fromAddress: "EMAIL_FROM_ADDRESS",
    fromName: "EMAIL_FROM_NAME",
  });

  const compliance = loadFromEnv(ComplianceConfigSchema, {
    rightsRequestSlaHours: "COMPLIANCE_RIGHTS_SLA_HOURS",
    breachNotificationHours: "COMPLIANCE_BREACH_NOTIFICATION_HOURS",
    consentExpiryDays: "COMPLIANCE_CONSENT_EXPIRY_DAYS",
    auditRetentionDays: "COMPLIANCE_AUDIT_RETENTION_DAYS",
    dataRetentionCheckInterval: "COMPLIANCE_RETENTION_CHECK_INTERVAL",
  });

  return { app, database, redis, auth, tenant, dspm, email, compliance };
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _config: PrivacyOpsConfig | null = null;

export function getConfig(): PrivacyOpsConfig {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

export function resetConfig(): void {
  _config = null;
}

// ─── Validation Helpers ───────────────────────────────────────────────────────

export function isProduction(): boolean {
  return getConfig().app.env === "production";
}

export function isDevelopment(): boolean {
  return getConfig().app.env === "development";
}

export function isTest(): boolean {
  return getConfig().app.env === "test";
}
