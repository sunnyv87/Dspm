import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  ClassificationTag,
  ClassificationSource,
} from '../../entities/classification-tag.entity';
import {
  ClassificationReviewItem,
  ReviewStatus,
} from '../../entities/classification-review-item.entity';
import { ClassificationRun, RunStatus } from '../../entities/classification-run.entity';
import { ClassificationPolicy } from '../../entities/classification-policy.entity';
import { PolicyService } from '../policy/policy.service';
import { DspmClientService } from '../dspm-client/dspm-client.service';
import { KafkaService } from '../../common/kafka/kafka.service';
import { OverrideClassificationDto } from './dto/override-classification.dto';
import { BulkApplyDto } from './dto/bulk-apply.dto';

export interface ClassificationResult {
  label: string;
  regulationTag: string;
  confidence: number;
  source: string;
}

@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name);
  private readonly discoveryServiceUrl: string;
  private readonly lowConfidenceThreshold = 0.6;

  constructor(
    @InjectRepository(ClassificationTag)
    private readonly tagRepo: Repository<ClassificationTag>,
    @InjectRepository(ClassificationReviewItem)
    private readonly reviewRepo: Repository<ClassificationReviewItem>,
    @InjectRepository(ClassificationRun)
    private readonly runRepo: Repository<ClassificationRun>,
    @InjectRepository(ClassificationPolicy)
    private readonly policyRepo: Repository<ClassificationPolicy>,
    private readonly policyService: PolicyService,
    private readonly dspmClientService: DspmClientService,
    private readonly kafkaService: KafkaService,
    private readonly configService: ConfigService,
  ) {
    this.discoveryServiceUrl =
      this.configService.get<string>('dspm.discoveryServiceUrl') ||
      'http://localhost:3007';
  }

  async applyClassification(
    assetId: string,
    tenantId: string,
    policyId?: string,
    force?: boolean,
  ): Promise<ClassificationTag[]> {
    // Fetch asset metadata from discovery-service
    const assetMetadata = await this.fetchAssetMetadata(assetId, tenantId);
    if (!assetMetadata) {
      throw new NotFoundException(`Asset ${assetId} not found in discovery service`);
    }

    // If not forcing, check if already classified
    if (!force) {
      const existingTags = await this.tagRepo.find({
        where: { tenantId, assetId },
      });
      if (existingTags.length > 0) {
        return existingTags;
      }
    }

    // Get active policies
    let policies: ClassificationPolicy[];
    if (policyId) {
      const policy = await this.policyService.findOne(tenantId, policyId);
      policies = [policy];
    } else {
      policies = await this.policyService.findActivePolicies(tenantId);
    }

    const allResults: Array<ClassificationResult & { policyId: string }> = [];

    // Run all active policies' rules against asset metadata
    for (const policy of policies) {
      const results = this.evaluateRules(policy.rulesJson, assetMetadata);
      for (const result of results) {
        allResults.push({ ...result, policyId: policy.id });
      }
    }

    // Also try to get DSPM classification signals
    const dspmResults = await this.dspmClientService.fetchClassificationResults(tenantId);
    const assetDspmResults = dspmResults.filter(
      (r: any) => r.assetId === assetId,
    );
    for (const dspmResult of assetDspmResults) {
      allResults.push({
        label: dspmResult.label || dspmResult.classification,
        regulationTag: dspmResult.regulationTag || dspmResult.regulation || '',
        confidence: dspmResult.confidence || 0.75,
        source: 'dspm',
        policyId: null,
      });
    }

    // If no results, apply default label from highest-priority policy
    if (allResults.length === 0 && policies.length > 0) {
      allResults.push({
        label: policies[0].defaultLabel,
        regulationTag: '',
        confidence: 1.0,
        source: 'rule',
        policyId: policies[0].id,
      });
    }

    // Remove existing tags if force re-classification
    if (force) {
      await this.tagRepo.delete({ tenantId, assetId });
    }

    // Create classification tags
    const createdTags: ClassificationTag[] = [];
    for (const result of allResults) {
      const tag = this.tagRepo.create({
        tenantId,
        assetId,
        assetName: assetMetadata.name || assetMetadata.assetName || null,
        label: result.label,
        regulationTag: result.regulationTag || null,
        confidenceScore: result.confidence,
        source: result.source as ClassificationSource,
        policyId: result.policyId || null,
        metadata: {
          assetPath: assetMetadata.path,
          classifiedAt: new Date().toISOString(),
        },
      });
      const saved = await this.tagRepo.save(tag);
      createdTags.push(saved);

      // Create review items for low-confidence results
      if (result.confidence < this.lowConfidenceThreshold) {
        const reviewItem = this.reviewRepo.create({
          tenantId,
          classificationTagId: saved.id,
          assetId,
          assetName: assetMetadata.name || assetMetadata.assetName || null,
          currentLabel: result.label,
          suggestedLabel: null,
          reason: `Low confidence classification (${(result.confidence * 100).toFixed(1)}%)`,
          status: ReviewStatus.PENDING,
        });
        await this.reviewRepo.save(reviewItem);
      }
    }

    // Emit event
    await this.kafkaService.emit('classification.asset.classified', {
      key: assetId,
      value: {
        eventType: 'ASSET_CLASSIFIED',
        tenantId,
        assetId,
        tagCount: createdTags.length,
        labels: createdTags.map((t) => t.label),
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(
      `Applied ${createdTags.length} classification tags to asset ${assetId}`,
    );
    return createdTags;
  }

  async overrideClassification(
    assetId: string,
    tenantId: string,
    reviewerId: string,
    dto: OverrideClassificationDto,
  ): Promise<ClassificationTag> {
    const tag = await this.tagRepo.findOne({
      where: { id: dto.tagId, tenantId, assetId },
    });
    if (!tag) {
      throw new NotFoundException(
        `Classification tag ${dto.tagId} not found for asset ${assetId}`,
      );
    }

    const previousLabel = tag.label;
    tag.previousLabel = previousLabel;
    tag.label = dto.newLabel;
    tag.regulationTag = dto.regulationTag || tag.regulationTag;
    tag.source = ClassificationSource.MANUAL;
    tag.confidenceScore = 1.0;
    tag.reviewerId = reviewerId;
    tag.reviewedAt = new Date();
    tag.reviewNotes = dto.reviewNotes || null;

    const saved = await this.tagRepo.save(tag);

    // Resolve any pending review items for this tag
    await this.reviewRepo.update(
      { classificationTagId: dto.tagId, status: ReviewStatus.PENDING },
      {
        status: ReviewStatus.OVERRIDDEN,
        reviewerId,
        reviewedAt: new Date(),
        reviewNotes: dto.reviewNotes || `Overridden from "${previousLabel}" to "${dto.newLabel}"`,
      },
    );

    await this.kafkaService.emit('classification.tag.overridden', {
      key: assetId,
      value: {
        eventType: 'TAG_OVERRIDDEN',
        tenantId,
        assetId,
        tagId: dto.tagId,
        previousLabel,
        newLabel: dto.newLabel,
        reviewerId,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(
      `Classification tag ${dto.tagId} overridden: "${previousLabel}" -> "${dto.newLabel}"`,
    );
    return saved;
  }

  async bulkApply(
    tenantId: string,
    userId: string,
    dto: BulkApplyDto,
  ): Promise<ClassificationRun> {
    // Create a classification run
    const run = this.runRepo.create({
      tenantId,
      policyId: dto.policyId || null,
      status: RunStatus.QUEUED,
      triggeredBy: userId,
    });
    const savedRun = await this.runRepo.save(run);

    // Process asynchronously
    this.processBulkClassification(savedRun.id, tenantId, dto).catch((err) => {
      this.logger.error(
        `Bulk classification run ${savedRun.id} failed: ${err.message}`,
      );
    });

    return savedRun;
  }

  private async processBulkClassification(
    runId: string,
    tenantId: string,
    dto: BulkApplyDto,
  ): Promise<void> {
    const run = await this.runRepo.findOne({ where: { id: runId } });
    if (!run) return;

    run.status = RunStatus.RUNNING;
    run.startedAt = new Date();
    await this.runRepo.save(run);

    try {
      // Fetch assets from discovery-service
      let assets: any[] = [];
      if (dto.assetIds && dto.assetIds.length > 0) {
        assets = [];
        for (const assetId of dto.assetIds) {
          const asset = await this.fetchAssetMetadata(assetId, tenantId);
          if (asset) {
            assets.push({ ...asset, id: assetId });
          }
        }
      } else {
        assets = await this.fetchAssets(tenantId, dto.dataSourceId);
      }

      run.totalAssets = assets.length;
      await this.runRepo.save(run);

      // Process in batches of 50
      const batchSize = 50;
      for (let i = 0; i < assets.length; i += batchSize) {
        const batch = assets.slice(i, i + batchSize);

        for (const asset of batch) {
          try {
            const assetId = asset.id || asset.assetId;
            const tags = await this.applyClassification(
              assetId,
              tenantId,
              dto.policyId,
              true,
            );

            run.processedAssets += 1;

            // Count new vs updated
            const existingCount = await this.tagRepo.count({
              where: { tenantId, assetId, previousLabel: undefined },
            });
            if (existingCount > 0) {
              run.updatedTags += tags.length;
            } else {
              run.newTags += tags.length;
            }
          } catch (error) {
            run.errors += 1;
            this.logger.warn(
              `Error classifying asset ${asset.id}: ${(error as Error).message}`,
            );
          }
        }

        await this.runRepo.save(run);
      }

      run.status = RunStatus.COMPLETED;
      run.completedAt = new Date();
      await this.runRepo.save(run);

      await this.kafkaService.emit('classification.run.completed', {
        key: runId,
        value: {
          eventType: 'RUN_COMPLETED',
          tenantId,
          runId,
          totalAssets: run.totalAssets,
          processedAssets: run.processedAssets,
          newTags: run.newTags,
          updatedTags: run.updatedTags,
          errors: run.errors,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(
        `Bulk classification run ${runId} completed: ${run.processedAssets}/${run.totalAssets} assets processed`,
      );
    } catch (error) {
      run.status = RunStatus.FAILED;
      run.completedAt = new Date();
      await this.runRepo.save(run);

      this.logger.error(
        `Bulk classification run ${runId} failed: ${(error as Error).message}`,
      );
    }
  }

  async getClassifiedAssets(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
    label?: string,
    regulationTag?: string,
    source?: string,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const qb = this.tagRepo
      .createQueryBuilder('tag')
      .where('tag.tenantId = :tenantId', { tenantId });

    if (label) {
      qb.andWhere('tag.label = :label', { label });
    }
    if (regulationTag) {
      qb.andWhere('tag.regulationTag = :regulationTag', { regulationTag });
    }
    if (source) {
      qb.andWhere('tag.source = :source', { source });
    }

    qb.orderBy('tag.createdAt', 'DESC');

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async getAssetTags(
    tenantId: string,
    assetId: string,
  ): Promise<ClassificationTag[]> {
    return this.tagRepo.find({
      where: { tenantId, assetId },
      relations: ['policy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUniqueTags(
    tenantId: string,
  ): Promise<{ label: string; count: number }[]> {
    const result = await this.tagRepo
      .createQueryBuilder('tag')
      .select('tag.label', 'label')
      .addSelect('COUNT(tag.id)', 'count')
      .where('tag.tenantId = :tenantId', { tenantId })
      .groupBy('tag.label')
      .orderBy('count', 'DESC')
      .getRawMany();

    return result.map((r) => ({
      label: r.label,
      count: parseInt(r.count, 10),
    }));
  }

  async getStats(tenantId: string): Promise<{
    totalClassifiedAssets: number;
    totalTags: number;
    byLabel: { label: string; count: number }[];
    byRegulation: { regulationTag: string; count: number }[];
    bySource: { source: string; count: number }[];
    lowConfidenceCount: number;
    pendingReviewCount: number;
  }> {
    const totalTags = await this.tagRepo.count({ where: { tenantId } });

    const classifiedAssets = await this.tagRepo
      .createQueryBuilder('tag')
      .select('COUNT(DISTINCT tag.assetId)', 'count')
      .where('tag.tenantId = :tenantId', { tenantId })
      .getRawOne();

    const byLabel = await this.tagRepo
      .createQueryBuilder('tag')
      .select('tag.label', 'label')
      .addSelect('COUNT(tag.id)', 'count')
      .where('tag.tenantId = :tenantId', { tenantId })
      .groupBy('tag.label')
      .orderBy('count', 'DESC')
      .getRawMany();

    const byRegulation = await this.tagRepo
      .createQueryBuilder('tag')
      .select('tag.regulationTag', 'regulationTag')
      .addSelect('COUNT(tag.id)', 'count')
      .where('tag.tenantId = :tenantId', { tenantId })
      .andWhere('tag.regulationTag IS NOT NULL')
      .groupBy('tag.regulationTag')
      .orderBy('count', 'DESC')
      .getRawMany();

    const bySource = await this.tagRepo
      .createQueryBuilder('tag')
      .select('tag.source', 'source')
      .addSelect('COUNT(tag.id)', 'count')
      .where('tag.tenantId = :tenantId', { tenantId })
      .groupBy('tag.source')
      .orderBy('count', 'DESC')
      .getRawMany();

    const lowConfidenceCount = await this.tagRepo
      .createQueryBuilder('tag')
      .where('tag.tenantId = :tenantId', { tenantId })
      .andWhere('tag.confidenceScore < :threshold', {
        threshold: this.lowConfidenceThreshold,
      })
      .getCount();

    const pendingReviewCount = await this.reviewRepo.count({
      where: { tenantId, status: ReviewStatus.PENDING },
    });

    return {
      totalClassifiedAssets: parseInt(classifiedAssets?.count || '0', 10),
      totalTags,
      byLabel: byLabel.map((r) => ({
        label: r.label,
        count: parseInt(r.count, 10),
      })),
      byRegulation: byRegulation.map((r) => ({
        regulationTag: r.regulationTag,
        count: parseInt(r.count, 10),
      })),
      bySource: bySource.map((r) => ({
        source: r.source,
        count: parseInt(r.count, 10),
      })),
      lowConfidenceCount,
      pendingReviewCount,
    };
  }

  private evaluateRules(
    rules: any[],
    assetMetadata: any,
  ): ClassificationResult[] {
    const results: ClassificationResult[] = [];

    for (const rule of rules) {
      if (rule.type === 'regex') {
        const regex = new RegExp(rule.pattern, 'gi');
        const searchText = [
          assetMetadata.name,
          assetMetadata.path,
          ...(assetMetadata.columnNames || []),
        ].join(' ');
        if (regex.test(searchText)) {
          results.push({
            label: rule.label,
            regulationTag: rule.regulationTag,
            confidence: rule.confidence || 0.8,
            source: 'rule',
          });
        }
      } else if (rule.type === 'keyword') {
        const keywords = rule.pattern
          .split(',')
          .map((k: string) => k.trim().toLowerCase());
        const searchText = [assetMetadata.name, assetMetadata.path]
          .join(' ')
          .toLowerCase();
        if (keywords.some((kw: string) => searchText.includes(kw))) {
          results.push({
            label: rule.label,
            regulationTag: rule.regulationTag,
            confidence: rule.confidence || 0.7,
            source: 'rule',
          });
        }
      }
    }

    return results;
  }

  private async fetchAssetMetadata(
    assetId: string,
    tenantId: string,
  ): Promise<any | null> {
    try {
      const response = await axios.get(
        `${this.discoveryServiceUrl}/api/v1/discovery/assets/${assetId}`,
        {
          headers: { 'X-Tenant-Id': tenantId },
          timeout: 10000,
        },
      );
      return response.data;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch asset ${assetId} from discovery service: ${(error as Error).message}`,
      );
      return null;
    }
  }

  private async fetchAssets(
    tenantId: string,
    dataSourceId?: string,
  ): Promise<any[]> {
    try {
      const params: any = {};
      if (dataSourceId) {
        params.dataSourceId = dataSourceId;
      }
      const response = await axios.get(
        `${this.discoveryServiceUrl}/api/v1/discovery/assets`,
        {
          headers: { 'X-Tenant-Id': tenantId },
          params,
          timeout: 30000,
        },
      );
      return response.data?.data || response.data || [];
    } catch (error) {
      this.logger.warn(
        `Failed to fetch assets from discovery service: ${(error as Error).message}`,
      );
      return [];
    }
  }
}
