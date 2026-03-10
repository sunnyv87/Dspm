import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataAsset } from '../../entities/data-asset.entity';
import { AssetLineage } from '../../entities/asset-lineage.entity';
import { QueryAssetDto } from './dto/query-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

export interface AssetStats {
  totalAssets: number;
  byAssetType: Record<string, number>;
  bySensitivityLevel: Record<string, number>;
  byEncryptionStatus: Record<string, number>;
  byExposureStatus: Record<string, number>;
  personalDataAssets: number;
  totalSizeBytes: number;
}

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    @InjectRepository(DataAsset)
    private readonly assetRepository: Repository<DataAsset>,
    @InjectRepository(AssetLineage)
    private readonly lineageRepository: Repository<AssetLineage>,
  ) {}

  async findAll(
    tenantId: string,
    query: QueryAssetDto,
  ): Promise<{ data: DataAsset[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.assetRepository
      .createQueryBuilder('asset')
      .where('asset.tenantId = :tenantId', { tenantId });

    if (query.dataSourceId) {
      qb.andWhere('asset.dataSourceId = :dataSourceId', { dataSourceId: query.dataSourceId });
    }

    if (query.assetType) {
      qb.andWhere('asset.assetType = :assetType', { assetType: query.assetType });
    }

    if (query.sensitivityLevel) {
      qb.andWhere('asset.sensitivityLevel = :sensitivityLevel', { sensitivityLevel: query.sensitivityLevel });
    }

    if (query.containsPersonalData !== undefined) {
      qb.andWhere('asset.containsPersonalData = :containsPersonalData', { containsPersonalData: query.containsPersonalData });
    }

    qb.orderBy('asset.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<DataAsset> {
    const asset = await this.assetRepository.findOne({
      where: { id, tenantId },
      relations: ['dataSource'],
    });

    if (!asset) {
      throw new NotFoundException(`Data asset ${id} not found`);
    }

    return asset;
  }

  async update(tenantId: string, id: string, dto: UpdateAssetDto): Promise<DataAsset> {
    const asset = await this.findById(tenantId, id);

    if (dto.ownerUserId !== undefined) asset.ownerUserId = dto.ownerUserId;
    if (dto.businessOwner !== undefined) asset.businessOwner = dto.businessOwner;
    if (dto.tags !== undefined) asset.tags = dto.tags;
    if (dto.classifications !== undefined) asset.classifications = dto.classifications;

    const saved = await this.assetRepository.save(asset);
    this.logger.log(`Asset updated: ${id} for tenant ${tenantId}`);
    return saved;
  }

  async getLineage(
    tenantId: string,
    assetId: string,
  ): Promise<{ upstream: AssetLineage[]; downstream: AssetLineage[] }> {
    // Verify asset exists
    await this.findById(tenantId, assetId);

    const upstream = await this.lineageRepository.find({
      where: { tenantId, targetAssetId: assetId },
      relations: ['sourceAsset'],
      order: { discoveredAt: 'DESC' },
    });

    const downstream = await this.lineageRepository.find({
      where: { tenantId, sourceAssetId: assetId },
      relations: ['targetAsset'],
      order: { discoveredAt: 'DESC' },
    });

    return { upstream, downstream };
  }

  async getStats(tenantId: string): Promise<AssetStats> {
    const qb = this.assetRepository
      .createQueryBuilder('asset')
      .where('asset.tenantId = :tenantId', { tenantId });

    const totalAssets = await qb.getCount();

    const byAssetTypeRaw = await this.assetRepository
      .createQueryBuilder('asset')
      .select('asset.assetType', 'assetType')
      .addSelect('COUNT(*)', 'count')
      .where('asset.tenantId = :tenantId', { tenantId })
      .groupBy('asset.assetType')
      .getRawMany();

    const byAssetType: Record<string, number> = {};
    for (const row of byAssetTypeRaw) {
      byAssetType[row.assetType] = parseInt(row.count, 10);
    }

    const bySensitivityLevelRaw = await this.assetRepository
      .createQueryBuilder('asset')
      .select('asset.sensitivityLevel', 'sensitivityLevel')
      .addSelect('COUNT(*)', 'count')
      .where('asset.tenantId = :tenantId', { tenantId })
      .andWhere('asset.sensitivityLevel IS NOT NULL')
      .groupBy('asset.sensitivityLevel')
      .getRawMany();

    const bySensitivityLevel: Record<string, number> = {};
    for (const row of bySensitivityLevelRaw) {
      bySensitivityLevel[row.sensitivityLevel] = parseInt(row.count, 10);
    }

    const byEncryptionStatusRaw = await this.assetRepository
      .createQueryBuilder('asset')
      .select('asset.encryptionStatus', 'encryptionStatus')
      .addSelect('COUNT(*)', 'count')
      .where('asset.tenantId = :tenantId', { tenantId })
      .groupBy('asset.encryptionStatus')
      .getRawMany();

    const byEncryptionStatus: Record<string, number> = {};
    for (const row of byEncryptionStatusRaw) {
      byEncryptionStatus[row.encryptionStatus] = parseInt(row.count, 10);
    }

    const byExposureStatusRaw = await this.assetRepository
      .createQueryBuilder('asset')
      .select('asset.exposureStatus', 'exposureStatus')
      .addSelect('COUNT(*)', 'count')
      .where('asset.tenantId = :tenantId', { tenantId })
      .groupBy('asset.exposureStatus')
      .getRawMany();

    const byExposureStatus: Record<string, number> = {};
    for (const row of byExposureStatusRaw) {
      byExposureStatus[row.exposureStatus] = parseInt(row.count, 10);
    }

    const personalDataResult = await this.assetRepository
      .createQueryBuilder('asset')
      .where('asset.tenantId = :tenantId', { tenantId })
      .andWhere('asset.containsPersonalData = :containsPersonalData', { containsPersonalData: true })
      .getCount();

    const totalSizeResult = await this.assetRepository
      .createQueryBuilder('asset')
      .select('COALESCE(SUM(asset.sizeBytes), 0)', 'totalSize')
      .where('asset.tenantId = :tenantId', { tenantId })
      .getRawOne();

    return {
      totalAssets,
      byAssetType,
      bySensitivityLevel,
      byEncryptionStatus,
      byExposureStatus,
      personalDataAssets: personalDataResult,
      totalSizeBytes: parseInt(totalSizeResult?.totalSize || '0', 10),
    };
  }
}
