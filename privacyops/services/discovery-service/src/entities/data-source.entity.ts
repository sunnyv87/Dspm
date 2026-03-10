import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { DataAsset } from './data-asset.entity';
import { SyncJob } from './sync-job.entity';

export enum DataSourceType {
  AWS_S3 = 'aws_s3',
  AZURE_BLOB = 'azure_blob',
  GCS = 'gcs',
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  MONGODB = 'mongodb',
  SNOWFLAKE = 'snowflake',
  BIGQUERY = 'bigquery',
  REDSHIFT = 'redshift',
  SHAREPOINT = 'sharepoint',
  ONEDRIVE = 'onedrive',
  GOOGLE_DRIVE = 'google_drive',
  SALESFORCE = 'salesforce',
  SLACK = 'slack',
  GITHUB = 'github',
  ON_PREM_FS = 'on_prem_fs',
  CUSTOM = 'custom',
}

export enum DataSourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum CredentialType {
  API_KEY = 'api_key',
  OAUTH2 = 'oauth2',
  SERVICE_ACCOUNT = 'service_account',
  USERNAME_PASSWORD = 'username_password',
  IAM_ROLE = 'iam_role',
  CERTIFICATE = 'certificate',
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

@Entity('data_sources')
@Index(['tenantId'])
export class DataSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: DataSourceType })
  type: DataSourceType;

  @Column({ type: 'enum', enum: DataSourceStatus, default: DataSourceStatus.PENDING })
  status: DataSourceStatus;

  @Column({ type: 'jsonb', nullable: true })
  connectionConfig: Record<string, any>;

  @Column({ type: 'enum', enum: CredentialType })
  credentialType: CredentialType;

  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessUnit: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastHealthCheckAt: Date;

  @Column({ type: 'enum', enum: HealthStatus, default: HealthStatus.UNKNOWN })
  healthStatus: HealthStatus;

  @Column({ type: 'int', default: 0 })
  assetCount: number;

  @Column({ type: 'int', default: 0 })
  sensitiveAssetCount: number;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => DataAsset, (asset) => asset.dataSource)
  assets: DataAsset[];

  @OneToMany(() => SyncJob, (job) => job.dataSource)
  syncJobs: SyncJob[];
}
