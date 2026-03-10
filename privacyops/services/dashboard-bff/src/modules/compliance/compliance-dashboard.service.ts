import { Injectable, Logger } from '@nestjs/common';
import { ServiceClientService } from '../service-client/service-client.service';

@Injectable()
export class ComplianceDashboardService {
  private readonly logger = new Logger(ComplianceDashboardService.name);

  constructor(private readonly serviceClient: ServiceClientService) {}

  async getSummary(token?: string): Promise<any> {
    this.logger.debug('Fetching compliance dashboard summary');

    const [complianceStats, consentStats, retentionStats] = await Promise.all([
      this.serviceClient.getComplianceStats(token),
      this.serviceClient.getConsentStats(token),
      this.serviceClient.getRetentionStats(token),
    ]);

    return {
      overallScore: complianceStats?.overallScore ?? 0,
      frameworks: complianceStats?.frameworks ?? [],
      totalGaps: complianceStats?.gaps ?? 0,
      consentCompliance: {
        activeConsents: consentStats?.activeConsents ?? 0,
        expiredConsents: consentStats?.expiredConsents ?? 0,
        totalConsents: consentStats?.totalConsents ?? 0,
      },
      retentionCompliance: {
        totalPolicies: retentionStats?.totalPolicies ?? 0,
        overdue: retentionStats?.overdue ?? 0,
        expiringSoon: retentionStats?.expiringSoon ?? 0,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  async getFrameworks(token?: string): Promise<any> {
    this.logger.debug('Fetching compliance frameworks');

    const frameworks = await this.serviceClient.getComplianceFrameworks(token);

    return {
      frameworks: Array.isArray(frameworks) ? frameworks : [],
      generatedAt: new Date().toISOString(),
    };
  }

  async getTrends(token?: string): Promise<any> {
    this.logger.debug('Fetching compliance trends');

    const trends = await this.serviceClient.getComplianceTrends(token);

    return {
      trends: Array.isArray(trends) ? trends : [],
      generatedAt: new Date().toISOString(),
    };
  }
}
