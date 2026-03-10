import type { UUID, ISODateString } from "./common";
import type { SystemRole, Permission, MfaMethod } from "./user";

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  API_KEY = "api_key",
  PASSWORD_RESET = "password_reset",
  EMAIL_VERIFICATION = "email_verification",
  INVITE = "invite",
}

export enum SessionStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
  LOGGED_OUT = "logged_out",
}

export enum AuthEventType {
  LOGIN_SUCCESS = "login_success",
  LOGIN_FAILURE = "login_failure",
  LOGOUT = "logout",
  TOKEN_REFRESH = "token_refresh",
  PASSWORD_CHANGE = "password_change",
  PASSWORD_RESET_REQUEST = "password_reset_request",
  PASSWORD_RESET_COMPLETE = "password_reset_complete",
  MFA_SETUP = "mfa_setup",
  MFA_VERIFY = "mfa_verify",
  MFA_FAILURE = "mfa_failure",
  ACCOUNT_LOCKED = "account_locked",
  ACCOUNT_UNLOCKED = "account_unlocked",
  SESSION_REVOKED = "session_revoked",
  API_KEY_CREATED = "api_key_created",
  API_KEY_REVOKED = "api_key_revoked",
}

// ─── Token Interfaces ─────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: UUID;
  tenantId: UUID;
  email: string;
  roles: SystemRole[];
  permissions: Permission[];
  sessionId: UUID;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  type: TokenType.ACCESS;
}

export interface RefreshTokenPayload {
  sub: UUID;
  tenantId: UUID;
  sessionId: UUID;
  tokenFamily: UUID;
  iat: number;
  exp: number;
  iss: string;
  type: TokenType.REFRESH;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: ISODateString;
  refreshTokenExpiresAt: ISODateString;
  tokenType: "Bearer";
}

// ─── Session Interfaces ──────────────────────────────────────────────────────

export interface Session {
  id: UUID;
  userId: UUID;
  tenantId: UUID;
  status: SessionStatus;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  lastActivityAt: ISODateString;
  createdAt: ISODateString;
  expiresAt: ISODateString;
  revokedAt?: ISODateString;
  revokedReason?: string;
  refreshTokenFamily: UUID;
  mfaVerified: boolean;
}

// ─── API Key ──────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: UUID;
  tenantId: UUID;
  userId: UUID;
  name: string;
  keyPrefix: string;
  keyHash: string;
  permissions: Permission[];
  lastUsedAt?: ISODateString;
  expiresAt?: ISODateString;
  isActive: boolean;
  createdAt: ISODateString;
  revokedAt?: ISODateString;
  revokedBy?: UUID;
  rateLimit: number;
  allowedIps?: string[];
}

export interface CreateApiKeyRequest {
  name: string;
  permissions: Permission[];
  expiresAt?: ISODateString;
  rateLimit?: number;
  allowedIps?: string[];
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  rawKey: string;
}

// ─── Auth Requests / Responses ────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug?: string;
  mfaCode?: string;
  deviceFingerprint?: string;
}

export interface LoginResponse {
  tokens: TokenPair;
  user: {
    id: UUID;
    email: string;
    displayName: string;
    roles: SystemRole[];
    tenantId: UUID;
    tenantSlug: string;
  };
  mfaRequired: boolean;
  mfaMethod?: MfaMethod;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface MfaSetupRequest {
  method: MfaMethod;
}

export interface MfaSetupResponse {
  secret?: string;
  qrCodeDataUrl?: string;
  backupCodes?: string[];
  phoneNumber?: string;
}

export interface MfaVerifyRequest {
  code: string;
  method: MfaMethod;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ─── Auth Event Log ──────────────────────────────────────────────────────────

export interface AuthEvent {
  id: UUID;
  tenantId?: UUID;
  userId?: UUID;
  eventType: AuthEventType;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  timestamp: ISODateString;
}
