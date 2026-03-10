import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { DataSource } from './data-source.entity';
import { AssetLineage } from './asset-lineage.entity';

export enum AssetType {
  FILE = 'file',
  TABLE = 'table',
  DATABASE = 'database',
  BUCKET = 'bucket',
  COLLECTION = 'collection',
  CHANNEL = 'channel',
  REPOSITORY = 'repository',
  DOCUMENT = 'document',
  SCHEMA = 'schema',
  FOLDER = 'folder',
}

export enum SensitivityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  HIGHLY_SENSITIVE = 'highly_sensitive',
}

export enum EncryptionStatus {
  ENCRYPTED = 'encrypted',
  UNENCRYPTED = 'unencrypted',
  PARTIAL = 'partial',
  UNKNOWN = 'unknown',
}

export enum ExposureStatus {
  PRIVATE = 'private',
  INTERNAL = 'internal',
  PUBLIC = 'public',
  SHARED_EXTERNAL = 'shared_external',
}

@Entity('data_assets')
@Index(['tenantId', 'dataSourceId'])
@Index(['tenantId', 'assetType'])
@Index(['tenantId', 'sensitivityLevel'])
export class DataAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  dataSourceId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  dspmAssetId: string;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  path: string;

  @Column({ type: 'enum', enum: AssetType })
  assetType: AssetType;

  @Column({ type: 'bigint', nullable: true })
  sizeBytes: number;

  @Column({ type: 'enum', enum: SensitivityLevel, nullable: true })
  sensitivityLevel: SensitivityLevel;

  @Column({ type: 'enum', enum: EncryptionStatus, default: EncryptionStatus.UNKNOWN })
  encryptionStatus: EncryptionStatus;

  @Column({ type: 'enum', enum: ExposureStatus, default: ExposureStatus.PRIVATE })
  exposureStatus: ExposureStatus;

  @Column({ type: 'boolean', default: false })
  containsPersonalData: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  sensitivityScore: number;

  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessOwner: string;

  @Column({ type: 'jsonb', nullable: true })
  classifications: string[];

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastScannedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastModifiedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  geoRegion: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  riskScore: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => DataSource, (ds) => ds.assets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dataSourceId' })
  dataSource: DataSource;

  @OneToMany(() => AssetLineage, (lineage) => lineage.sourceAsset)
  outgoingLineage: AssetLineage[];

  @OneToMany(() => AssetLineage, (lineage) => lineage.targetAsset)
  incomingLineage: AssetLineage[];
}
