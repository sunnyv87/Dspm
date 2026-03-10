import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { KafkaService } from '../../common/kafka/kafka.service';

/**
 * Bridges the compliance-ai-service with the DSPM adapter service.
 * Pulls asset data, risk scores, classification results, and policy violations
 * from the DSPM module to feed into compliance scans and gap analysis.
 */
@Injectable()
export class DspmIntegrationService {
  private readonly logger = new Logger(DspmIntegrationService.name);
  private readonly dspmAdapterUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly kafkaService: KafkaService,
  ) {
    this.dspmAdapterUrl =
      this.configService.get<string>('dspm.adapterServiceUrl') ||
      'http://localhost:3004';
  }

  private async safeGet<T>(path: string, token?: string): Promise<T | null> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await firstValueFrom(
        this.httpService.get<T>(`${this.dspmAdapterUrl}${path}`, { headers }),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(
        `DSPM adapter call failed: ${path} - ${(error as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Fetch discovered data assets from DSPM for compliance context.
   */
  async getDiscoveredAssets(token?: string): Promise<any[]> {
    const result = await this.safeGet<any>('/api/v1/dspm/assets', token);
    return result?.data || result || [];
  }

  /**
   * Fetch classification results from DSPM for data mapping.
   */
  async getClassificationResults(token?: string): Promise<any[]> {
    const result = await this.safeGet<any>('/api/v1/dspm/classification/results', token);
    return result?.data || result || [];
  }

  /**
   * Fetch risk scores from DSPM to correlate with compliance findings.
   */
  async getRiskScores(token?: string): Promise<any[]> {
    const result = await this.safeGet<any>('/api/v1/dspm/risk/scores', token);
    return result?.data || result || [];
  }

  /**
   * Fetch policy violations from DSPM.
   */
  async getPolicyViolations(token?: string): Promise<any[]> {
    const result = await this.safeGet<any>('/api/v1/dspm/policies/violations', token);
    return result?.data || result || [];
  }

  /**
   * Fetch security alerts from DSPM.
   */
  async getSecurityAlerts(token?: string): Promise<any[]> {
    const result = await this.safeGet<any>('/api/v1/dspm/alerts', token);
    return result?.data || result || [];
  }

  /**
   * Aggregate DSPM posture data for compliance context.
   * Used to enrich compliance scans with real data security posture.
   */
  async getDspmPostureSummary(token?: string): Promise<{
    totalAssets: number;
    classifiedAssets: number;
    riskScores: { high: number; medium: number; low: number };
    policyViolations: number;
    openAlerts: number;
    lastSyncedAt: string;
  }> {
    const [assets, classifications, risks, violations, alerts] =
      await Promise.all([
        this.getDiscoveredAssets(token),
        this.getClassificationResults(token),
        this.getRiskScores(token),
        this.getPolicyViolations(token),
        this.getSecurityAlerts(token),
      ]);

    const riskScores = { high: 0, medium: 0, low: 0 };
    for (const risk of risks) {
      const level = (risk.riskLevel || risk.level || '').toLowerCase();
      if (level === 'high' || level === 'critical') riskScores.high++;
      else if (level === 'medium') riskScores.medium++;
      else riskScores.low++;
    }

    const summary = {
      totalAssets: assets.length,
      classifiedAssets: classifications.length,
      riskScores,
      policyViolations: violations.length,
      openAlerts: alerts.length,
      lastSyncedAt: new Date().toISOString(),
    };

    await this.kafkaService.emit('compliance-ai.dspm-posture.fetched', {
      value: {
        ...summary,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(
      `DSPM posture summary: ${summary.totalAssets} assets, ${summary.classifiedAssets} classified, ${summary.policyViolations} violations`,
    );

    return summary;
  }
}
