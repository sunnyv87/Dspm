import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DspmSyncEntity } from '../../entities/dspm-sync.entity';
import { DspmClientService } from '../dspm-client/dspm-client.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(DspmSyncEntity) private syncRepo: Repository<DspmSyncEntity>,
    private dspmClient: DspmClientService,
  ) {}

  async syncAssets(tenantId: string) {
    const syncLog = this.syncRepo.create({
      tenantId,
      resourceType: 'assets',
      syncDirection: 'pull',
      status: 'syncing',
    });
    await this.syncRepo.save(syncLog);

    try {
      const assets = await this.dspmClient.listAssets();
      syncLog.status = 'completed';
      syncLog.syncData = { count: assets.length || assets.data?.length || 0 };
      await this.syncRepo.save(syncLog);
      return { status: 'completed', assets };
    } catch (err) {
      syncLog.status = 'failed';
      syncLog.errorMessage = (err as Error).message;
      await this.syncRepo.save(syncLog);
      throw err;
    }
  }

  async syncClassifications(tenantId: string) {
    const syncLog = this.syncRepo.create({
      tenantId,
      resourceType: 'classifications',
      syncDirection: 'pull',
      status: 'syncing',
    });
    await this.syncRepo.save(syncLog);

    try {
      const results = await this.dspmClient.listClassificationResults();
      syncLog.status = 'completed';
      syncLog.syncData = { count: results.length || results.data?.length || 0 };
      await this.syncRepo.save(syncLog);
      return { status: 'completed', classifications: results };
    } catch (err) {
      syncLog.status = 'failed';
      syncLog.errorMessage = (err as Error).message;
      await this.syncRepo.save(syncLog);
      throw err;
    }
  }

  async syncRiskScores(tenantId: string) {
    const syncLog = this.syncRepo.create({
      tenantId,
      resourceType: 'risk_scores',
      syncDirection: 'pull',
      status: 'syncing',
    });
    await this.syncRepo.save(syncLog);

    try {
      const scores = await this.dspmClient.getRiskScores();
      syncLog.status = 'completed';
      syncLog.syncData = { count: scores.length || scores.data?.length || 0 };
      await this.syncRepo.save(syncLog);
      return { status: 'completed', riskScores: scores };
    } catch (err) {
      syncLog.status = 'failed';
      syncLog.errorMessage = (err as Error).message;
      await this.syncRepo.save(syncLog);
      throw err;
    }
  }

  async triggerScan(tenantId: string, connectorId: string, scanType: string = 'full') {
    const syncLog = this.syncRepo.create({
      tenantId,
      resourceType: 'scan',
      resourceId: connectorId,
      syncDirection: 'push',
      status: 'syncing',
    });
    await this.syncRepo.save(syncLog);

    try {
      const result = await this.dspmClient.createScan({ connector_id: connectorId, scan_type: scanType });
      syncLog.status = 'completed';
      syncLog.syncData = result;
      await this.syncRepo.save(syncLog);
      return result;
    } catch (err) {
      syncLog.status = 'failed';
      syncLog.errorMessage = (err as Error).message;
      await this.syncRepo.save(syncLog);
      throw err;
    }
  }

  async getSyncHistory(tenantId: string, resourceType?: string) {
    const where: any = { tenantId };
    if (resourceType) where.resourceType = resourceType;
    return this.syncRepo.find({ where, order: { syncedAt: 'DESC' }, take: 50 });
  }

  async fullSync(tenantId: string) {
    const results: Record<string, any> = {};
    try { results.assets = await this.syncAssets(tenantId); } catch (e) { results.assets = { error: (e as Error).message }; }
    try { results.classifications = await this.syncClassifications(tenantId); } catch (e) { results.classifications = { error: (e as Error).message }; }
    try { results.riskScores = await this.syncRiskScores(tenantId); } catch (e) { results.riskScores = { error: (e as Error).message }; }
    return results;
  }
}
