import type { UUID, ISODateString, AuditableEntity } from './common';

export enum DataSourceType {
  AWS_S3 = 'aws_s3', AZURE_BLOB = 'azure_blob', GCS = 'gcs',
  POSTGRESQL = 'postgresql', MYSQL = 'mysql', MONGODB = 'mongodb',
  SNOWFLAKE = 'snowflake', BIGQUERY = 'bigquery', REDSHIFT = 'redshift',
  SHAREPOINT = 'sharepoint', ONEDRIVE = 'onedrive', GOOGLE_DRIVE = 'google_drive',
  SALESFORCE = 'salesforce', SLACK = 'slack', GITHUB = 'github',
  ON_PREM_FS = 'on_prem_fs', CUSTOM = 'custom',
}

export enum DataSourceStatus {
  ACTIVE = 'active', INACTIVE = 'inactive', ERROR = 'error',
  PENDING = 'pending', SUSPENDED = 'suspended',
}

export enum CredentialType {
  API_KEY = 'api_key', OAUTH2 = 'oauth2', SERVICE_ACCOUNT = 'service_account',
  USERNAME_PASSWORD = 'username_password', IAM_ROLE = 'iam_role', CERTIFICATE = 'certificate',
}

export interface DataSource extends AuditableEntity {
  name: string;
  type: DataSourceType;
  status: DataSourceStatus;
  credentialType: CredentialType;
  config: Record<string, unknown>;
  lastSyncAt?: ISODateString;
  lastHealthCheckAt?: ISODateString;
  healthStatus: string;
  assetCount: number;
  sensitiveAssetCount: number;
  tags: string[];
  description?: string;
}

export interface CreateDataSourceRequest {
  name: string;
  type: DataSourceType;
  credentialType: CredentialType;
  config: Record<string, unknown>;
  credentials: Array<{ keyName: string; value: string }>;
  tags?: string[];
  description?: string;
}

export interface DataSourceHealthCheck {
  dataSourceId: UUID;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  checkedAt: ISODateString;
  details?: Record<string, unknown>;
}
