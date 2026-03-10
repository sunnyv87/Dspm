import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DataAsset } from './data-asset.entity';

export enum RelationshipType {
  DERIVED_FROM = 'derived_from',
  COPIED_TO = 'copied_to',
  TRANSFORMED_INTO = 'transformed_into',
  REFERENCES = 'references',
  PARENT_OF = 'parent_of',
  CHILD_OF = 'child_of',
}

@Entity('asset_lineage')
@Index(['tenantId'])
export class AssetLineage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  sourceAssetId: string;

  @Column({ type: 'uuid' })
  targetAssetId: string;

  @Column({ type: 'enum', enum: RelationshipType })
  relationshipType: RelationshipType;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  discoveredAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => DataAsset, (asset) => asset.outgoingLineage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceAssetId' })
  sourceAsset: DataAsset;

  @ManyToOne(() => DataAsset, (asset) => asset.incomingLineage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetAssetId' })
  targetAsset: DataAsset;
}
