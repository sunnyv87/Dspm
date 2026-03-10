import { Injectable, Logger } from '@nestjs/common';
import { ServiceClientService } from '../service-client/service-client.service';

@Injectable()
export class RiskDashboardService {
  private readonly logger = new Logger(RiskDashboardService.name);

  constructor(private readonly serviceClient: ServiceClientService) {}

  async getSummary(token?: string): Promise<any> {
    this.logger.debug('Fetching risk dashboard summary');

    const [privacyRiskStats, vendorRiskStats, riskTrends] = await Promise.all([
      this.serviceClient.getPrivacyRiskStats(token),
      this.serviceClient.getVendorRiskStats(token),
      this.serviceClient.getRiskTrends(token),
    ]);

    return {
      overallRiskScore: privacyRiskStats?.riskScore ?? 0,
      distribution: {
        high: privacyRiskStats?.highRisks ?? 0,
        medium: privacyRiskStats?.mediumRisks ?? 0,
        low: privacyRiskStats?.lowRisks ?? 0,
        total: privacyRiskStats?.totalRisks ?? 0,
      },
      vendorRisk: {
        totalVendors: vendorRiskStats?.totalVendors ?? 0,
        highRisk: vendorRiskStats?.highRiskVendors ?? 0,
        assessmentsDue: vendorRiskStats?.assessmentsDue ?? 0,
      },
      trends: riskTrends ?? [],
      generatedAt: new Date().toISOString(),
    };
  }

  async getHeatmap(token?: string): Promise<any> {
    this.logger.debug('Fetching risk heatmap data');

    const heatmapData = await this.serviceClient.getRiskHeatmap(token);

    return {
      cells: heatmapData?.cells ?? [],
      categories: heatmapData?.categories ?? [
        'Data Collection',
        'Data Storage',
        'Data Processing',
        'Data Sharing',
        'Data Retention',
      ],
      impacts: heatmapData?.impacts ?? [
        'Negligible',
        'Minor',
        'Moderate',
        'Significant',
        'Severe',
      ],
      likelihoods: [
        'Rare',
        'Unlikely',
        'Possible',
        'Likely',
        'Almost Certain',
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  async getVendors(token?: string): Promise<any> {
    this.logger.debug('Fetching vendor risk summary');

    const vendorRiskStats = await this.serviceClient.getVendorRiskStats(token);

    return {
      totalVendors: vendorRiskStats?.totalVendors ?? 0,
      distribution: {
        high: vendorRiskStats?.highRiskVendors ?? 0,
        medium: vendorRiskStats?.mediumRiskVendors ?? 0,
        low: vendorRiskStats?.lowRiskVendors ?? 0,
      },
      assessmentsDue: vendorRiskStats?.assessmentsDue ?? 0,
      topRiskVendors: vendorRiskStats?.topRiskVendors ?? [],
      recentAssessments: vendorRiskStats?.recentAssessments ?? [],
      generatedAt: new Date().toISOString(),
    };
  }
}
