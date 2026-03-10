import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncJob, SyncStatus, SyncType } from '../../entities/sync-job.entity';
import { DataSourceService } from '../data-source/data-source.service';
import { DspmClientService } from '../dspm-client/dspm-client.service';
import { KafkaService } from '../../common/kafka/kafka.service';
import { TriggerSyncDto } from './dto/trigger-sync.dto';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(SyncJob)
    private readonly syncJobRepository: Repository<SyncJob>,
    private readonly dataSourceService: DataSourceService,
    private readonly dspmClient: DspmClientService,
    private readonly kafkaService: KafkaService,
  ) {}

  async triggerSync(
    tenantId: string,
    userId: string,
    dto: TriggerSyncDto,
  ): Promise<SyncJob> {
    // Verify data source exists and belongs to tenant
    const dataSource = await this.dataSourceService.findById(tenantId, dto.dataSourceId);

    // Check for already running sync on this data source
    const runningJob = await this.syncJobRepository.findOne({
      where: {
        tenantId,
        dataSourceId: dto.dataSourceId,
        status: SyncStatus.RUNNING,
      },
    });

    if (runningJob) {
      throw new BadRequestException(
        `A sync job is already running for data source ${dto.dataSourceId}. Job ID: ${runningJob.id}`,
      );
    }

    // Create sync job record
    const syncJob = this.syncJobRepository.create({
      tenantId,
      dataSourceId: dto.dataSourceId,
      syncType: dto.syncType || SyncType.FULL,
      status: SyncStatus.QUEUED,
      triggeredBy: userId,
    });

    const savedJob = await this.syncJobRepository.save(syncJob);
    this.logger.log(`Sync job created: ${savedJob.id} for data source ${dto.dataSourceId}`);

    // Trigger scan via DSPM adapter
    try {
      const scanResponse = await this.dspmClient.triggerScan({
        dataSourceId: dto.dataSourceId,
        tenantId,
        syncType: dto.syncType || SyncType.FULL,
        connectionConfig: dataSource.connectionConfig,
      });

      savedJob.status = SyncStatus.RUNNING;
      savedJob.startedAt = new Date();
      await this.syncJobRepository.save(savedJob);

      this.logger.log(`DSPM scan started for job ${savedJob.id}, scan ID: ${scanResponse.scanId}`);
    } catch (error) {
      savedJob.status = SyncStatus.FAILED;
      savedJob.errorDetails = {
        message: (error as Error).message,
        failedAt: 'scan_trigger',
      };
      savedJob.completedAt = new Date();
      await this.syncJobRepository.save(savedJob);

      this.logger.error(`Failed to trigger DSPM scan for job ${savedJob.id}: ${(error as Error).message}`);
    }

    // Emit Kafka event
    await this.kafkaService.emit('discovery.events', {
      key: tenantId,
      value: {
        type: 'sync.started',
        tenantId,
        syncJobId: savedJob.id,
        dataSourceId: dto.dataSourceId,
        syncType: dto.syncType || SyncType.FULL,
        status: savedJob.status,
        triggeredBy: userId,
        timestamp: new Date().toISOString(),
      },
    });

    return savedJob;
  }

  async triggerAllSync(
    tenantId: string,
    userId: string,
    syncType: SyncType = SyncType.FULL,
  ): Promise<SyncJob[]> {
    const activeDataSources = await this.dataSourceService.findAllActive(tenantId);

    if (activeDataSources.length === 0) {
      this.logger.warn(`No active data sources found for tenant ${tenantId}`);
      return [];
    }

    const jobs: SyncJob[] = [];

    for (const dataSource of activeDataSources) {
      try {
        const job = await this.triggerSync(tenantId, userId, {
          dataSourceId: dataSource.id,
          syncType,
        });
        jobs.push(job);
      } catch (error) {
        this.logger.error(
          `Failed to trigger sync for data source ${dataSource.id}: ${(error as Error).message}`,
        );
      }
    }

    this.logger.log(
      `Triggered ${jobs.length} sync jobs for tenant ${tenantId} (${activeDataSources.length} active sources)`,
    );

    return jobs;
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: SyncJob[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.syncJobRepository.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['dataSource'],
    });

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<SyncJob> {
    const job = await this.syncJobRepository.findOne({
      where: { id, tenantId },
      relations: ['dataSource'],
    });

    if (!job) {
      throw new NotFoundException(`Sync job ${id} not found`);
    }

    return job;
  }

  async updateSyncProgress(
    jobId: string,
    progress: {
      totalAssets?: number;
      processedAssets?: number;
      newAssets?: number;
      updatedAssets?: number;
      errorCount?: number;
      errorDetails?: Record<string, any>;
    },
  ): Promise<SyncJob> {
    const job = await this.syncJobRepository.findOne({ where: { id: jobId } });

    if (!job) {
      throw new NotFoundException(`Sync job ${jobId} not found`);
    }

    if (progress.totalAssets !== undefined) job.totalAssets = progress.totalAssets;
    if (progress.processedAssets !== undefined) job.processedAssets = progress.processedAssets;
    if (progress.newAssets !== undefined) job.newAssets = progress.newAssets;
    if (progress.updatedAssets !== undefined) job.updatedAssets = progress.updatedAssets;
    if (progress.errorCount !== undefined) job.errorCount = progress.errorCount;
    if (progress.errorDetails !== undefined) job.errorDetails = progress.errorDetails;

    return this.syncJobRepository.save(job);
  }

  async completeSyncJob(
    jobId: string,
    result: {
      totalAssets: number;
      processedAssets: number;
      newAssets: number;
      updatedAssets: number;
      errorCount: number;
      errorDetails?: Record<string, any>;
    },
  ): Promise<SyncJob> {
    const job = await this.syncJobRepository.findOne({ where: { id: jobId } });

    if (!job) {
      throw new NotFoundException(`Sync job ${jobId} not found`);
    }

    job.status = result.errorCount > 0 && result.processedAssets === 0
      ? SyncStatus.FAILED
      : SyncStatus.COMPLETED;
    job.totalAssets = result.totalAssets;
    job.processedAssets = result.processedAssets;
    job.newAssets = result.newAssets;
    job.updatedAssets = result.updatedAssets;
    job.errorCount = result.errorCount;
    job.errorDetails = result.errorDetails || null;
    job.completedAt = new Date();

    const savedJob = await this.syncJobRepository.save(job);

    // Update data source lastSyncAt and asset counts
    if (job.dataSourceId) {
      await this.dataSourceService.updateLastSyncAt(job.dataSourceId);
      await this.dataSourceService.updateAssetCounts(
        job.dataSourceId,
        result.totalAssets,
        0, // Will be recalculated from actual asset data
      );
    }

    // Emit completion event
    await this.kafkaService.emit('discovery.events', {
      key: job.tenantId,
      value: {
        type: 'sync.completed',
        tenantId: job.tenantId,
        syncJobId: savedJob.id,
        dataSourceId: job.dataSourceId,
        status: savedJob.status,
        totalAssets: savedJob.totalAssets,
        newAssets: savedJob.newAssets,
        updatedAssets: savedJob.updatedAssets,
        errorCount: savedJob.errorCount,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(
      `Sync job completed: ${savedJob.id} - status=${savedJob.status}, total=${savedJob.totalAssets}, new=${savedJob.newAssets}, updated=${savedJob.updatedAssets}, errors=${savedJob.errorCount}`,
    );

    return savedJob;
  }

  async cancelSync(tenantId: string, id: string): Promise<SyncJob> {
    const job = await this.findById(tenantId, id);

    if (job.status !== SyncStatus.RUNNING && job.status !== SyncStatus.QUEUED) {
      throw new BadRequestException(
        `Cannot cancel sync job with status ${job.status}. Only queued or running jobs can be cancelled.`,
      );
    }

    // Attempt to cancel in DSPM adapter
    try {
      await this.dspmClient.cancelScan(id);
    } catch (error) {
      this.logger.warn(`Failed to cancel scan in DSPM adapter: ${(error as Error).message}`);
    }

    job.status = SyncStatus.CANCELLED;
    job.completedAt = new Date();

    const savedJob = await this.syncJobRepository.save(job);

    // Emit cancellation event
    await this.kafkaService.emit('discovery.events', {
      key: tenantId,
      value: {
        type: 'sync.cancelled',
        tenantId,
        syncJobId: savedJob.id,
        dataSourceId: job.dataSourceId,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Sync job cancelled: ${savedJob.id}`);
    return savedJob;
  }
}
