import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetLineage } from '../../entities/asset-lineage.entity';
import { DataAsset } from '../../entities/data-asset.entity';
import { CreateLineageDto } from './dto/create-lineage.dto';

export interface LineageGraph {
  assetId: string;
  assetName: string;
  upstream: LineageNode[];
  downstream: LineageNode[];
}

export interface LineageNode {
  id: string;
  assetId: string;
  assetName: string;
  assetPath: string | null;
  assetType: string;
  dataSourceId: string;
  relationshipType: string;
  metadata: Record<string, any> | null;
  discoveredAt: Date;
}

@Injectable()
export class LineageService {
  private readonly logger = new Logger(LineageService.name);

  constructor(
    @InjectRepository(AssetLineage)
    private readonly lineageRepository: Repository<AssetLineage>,
    @InjectRepository(DataAsset)
    private readonly assetRepository: Repository<DataAsset>,
  ) {}

  async getLineageGraph(tenantId: string, assetId: string): Promise<LineageGraph> {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId, tenantId },
    });

    if (!asset) {
      throw new NotFoundException(`Data asset ${assetId} not found`);
    }

    // Get upstream lineage (where this asset is the target)
    const upstreamLineage = await this.lineageRepository.find({
      where: { tenantId, targetAssetId: assetId },
      relations: ['sourceAsset'],
      order: { discoveredAt: 'DESC' },
    });

    const upstream: LineageNode[] = upstreamLineage.map((l) => ({
      id: l.id,
      assetId: l.sourceAssetId,
      assetName: l.sourceAsset?.name || 'Unknown',
      assetPath: l.sourceAsset?.path || null,
      assetType: l.sourceAsset?.assetType || 'unknown',
      dataSourceId: l.sourceAsset?.dataSourceId || '',
      relationshipType: l.relationshipType,
      metadata: l.metadata,
      discoveredAt: l.discoveredAt,
    }));

    // Get downstream lineage (where this asset is the source)
    const downstreamLineage = await this.lineageRepository.find({
      where: { tenantId, sourceAssetId: assetId },
      relations: ['targetAsset'],
      order: { discoveredAt: 'DESC' },
    });

    const downstream: LineageNode[] = downstreamLineage.map((l) => ({
      id: l.id,
      assetId: l.targetAssetId,
      assetName: l.targetAsset?.name || 'Unknown',
      assetPath: l.targetAsset?.path || null,
      assetType: l.targetAsset?.assetType || 'unknown',
      dataSourceId: l.targetAsset?.dataSourceId || '',
      relationshipType: l.relationshipType,
      metadata: l.metadata,
      discoveredAt: l.discoveredAt,
    }));

    return {
      assetId: asset.id,
      assetName: asset.name,
      upstream,
      downstream,
    };
  }

  async createLineage(tenantId: string, dto: CreateLineageDto): Promise<AssetLineage> {
    // Verify both assets exist and belong to the tenant
    const sourceAsset = await this.assetRepository.findOne({
      where: { id: dto.sourceAssetId, tenantId },
    });

    if (!sourceAsset) {
      throw new NotFoundException(`Source asset ${dto.sourceAssetId} not found`);
    }

    const targetAsset = await this.assetRepository.findOne({
      where: { id: dto.targetAssetId, tenantId },
    });

    if (!targetAsset) {
      throw new NotFoundException(`Target asset ${dto.targetAssetId} not found`);
    }

    if (dto.sourceAssetId === dto.targetAssetId) {
      throw new BadRequestException('Source and target assets must be different');
    }

    // Check for duplicate lineage
    const existing = await this.lineageRepository.findOne({
      where: {
        tenantId,
        sourceAssetId: dto.sourceAssetId,
        targetAssetId: dto.targetAssetId,
        relationshipType: dto.relationshipType,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `A ${dto.relationshipType} relationship already exists between these assets`,
      );
    }

    const lineage = this.lineageRepository.create({
      tenantId,
      sourceAssetId: dto.sourceAssetId,
      targetAssetId: dto.targetAssetId,
      relationshipType: dto.relationshipType,
      metadata: dto.metadata || null,
      discoveredAt: dto.discoveredAt ? new Date(dto.discoveredAt) : new Date(),
    });

    const saved = await this.lineageRepository.save(lineage);
    this.logger.log(
      `Lineage created: ${saved.id} (${dto.sourceAssetId} -> ${dto.targetAssetId}, ${dto.relationshipType})`,
    );
    return saved;
  }
}
