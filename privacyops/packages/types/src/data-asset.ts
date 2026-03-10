import type { UUID, ISODateString, AuditableEntity } from './common';

export enum AssetType {
  FILE = 'file', TABLE = 'table', DATABASE = 'database', BUCKET = 'bucket',
  COLLECTION = 'collection', CHANNEL = 'channel', REPOSITORY = 'repository',
  DOCUMENT = 'document', EMAIL = 'email', MESSAGE = 'message',
}

export enum SensitivityLevel {
  PUBLIC = 'public', INTERNAL = 'internal', CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted', HIGHLY_SENSITIVE = 'highly_sensitive',
}

export enum EncryptionStatus {
  ENCRYPTED = 'encrypted', UNENCRYPTED = 'unencrypted', PARTIAL = 'partial', UNKNOWN = 'unknown',
}

export enum ExposureStatus {
  PRIVATE = 'private', INTERNAL = 'internal', PUBLIC = 'public', SHARED_EXTERNAL = 'shared_external',
}

export interface DataAsset extends AuditableEntity {
  dataSourceId: UUID;
  name: string;
  path: string;
  assetType: AssetType;
  sizeBytes?: number;
  sensitivityLevel: SensitivityLevel;
  encryptionStatus: EncryptionStatus;
  exposureStatus: ExposureStatus;
  classifications: string[];
  tags: string[];
  ownerId?: UUID;
  lastScannedAt?: ISODateString;
  lastModifiedAt?: ISODateString;
  geoRegion?: string;
  riskScore?: number;
  metadata: Record<string, unknown>;
}
