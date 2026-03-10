import { Injectable, Logger } from '@nestjs/common';
import { ServiceClientService } from '../service-client/service-client.service';

@Injectable()
export class OverviewService {
  private readonly logger = new Logger(OverviewService.name);

  constructor(private readonly serviceClient: ServiceClientService) {}

  async getSummary(token?: string): Promise<any> {
    this.logger.debug('Fetching dashboard summary from all services');

    const [
      discoveryStats,
      classificationStats,
      consentStats,
      breachStats,
      vendorRiskStats,
      privacyRiskStats,
      complianceStats,
      rightsStats,
      retentionStats,
    ] = await Promise.all([
      this.serviceClient.getDiscoveryStats(token),
      this.serviceClient.getClassificationStats(token),
      this.serviceClient.getConsentStats(token),
      this.serviceClient.getBreachStats(token),
      this.serviceClient.getVendorRiskStats(token),
      this.serviceClient.getPrivacyRiskStats(token),
      this.serviceClient.getComplianceStats(token),
      this.serviceClient.getRightsStats(token),
      this.serviceClient.getRetentionStats(token),
    ]);

    return {
      totalAssets: discoveryStats?.totalAssets ?? 0,
      newAssets: discoveryStats?.newAssets ?? 0,
      classifiedAssets: classificationStats?.totalClassified ?? 0,
      pendingClassification: classificationStats?.pendingClassification ?? 0,
      activeConsents: consentStats?.activeConsents ?? 0,
      expiredConsents: consentStats?.expiredConsents ?? 0,
      openBreaches: breachStats?.openBreaches ?? 0,
      totalBreaches: breachStats?.totalBreaches ?? 0,
      riskScore: privacyRiskStats?.riskScore ?? 0,
      highRisks: privacyRiskStats?.highRisks ?? 0,
      highRiskVendors: vendorRiskStats?.highRiskVendors ?? 0,
      totalVendors: vendorRiskStats?.totalVendors ?? 0,
      complianceScore: complianceStats?.overallScore ?? 0,
      complianceGaps: complianceStats?.gaps ?? 0,
      pendingRequests: rightsStats?.pendingRequests ?? 0,
      totalRequests: rightsStats?.totalRequests ?? 0,
      retentionOverdue: retentionStats?.overdue ?? 0,
      retentionExpiringSoon: retentionStats?.expiringSoon ?? 0,
      generatedAt: new Date().toISOString(),
    };
  }

  async getMetrics(token?: string): Promise<any> {
    this.logger.debug('Fetching dashboard metrics');

    const [
      discoveryStats,
      privacyRiskStats,
      complianceStats,
      breachStats,
      rightsStats,
    ] = await Promise.all([
      this.serviceClient.getDiscoveryStats(token),
      this.serviceClient.getPrivacyRiskStats(token),
      this.serviceClient.getComplianceStats(token),
      this.serviceClient.getBreachStats(token),
      this.serviceClient.getRightsStats(token),
    ]);

    return {
      metrics: [
        {
          name: 'Total Data Assets',
          value: discoveryStats?.totalAssets ?? 0,
          change: discoveryStats?.newAssets ?? 0,
          changeType: 'increase',
          category: 'discovery',
        },
        {
          name: 'Risk Score',
          value: privacyRiskStats?.riskScore ?? 0,
          breakdown: {
            high: privacyRiskStats?.highRisks ?? 0,
            medium: privacyRiskStats?.mediumRisks ?? 0,
            low: privacyRiskStats?.lowRisks ?? 0,
          },
          category: 'risk',
        },
        {
          name: 'Compliance Score',
          value: complianceStats?.overallScore ?? 0,
          gaps: complianceStats?.gaps ?? 0,
          category: 'compliance',
        },
        {
          name: 'Open Breaches',
          value: breachStats?.openBreaches ?? 0,
          total: breachStats?.totalBreaches ?? 0,
          severity: breachStats?.severity ?? {},
          category: 'breach',
        },
        {
          name: 'Pending DSR Requests',
          value: rightsStats?.pendingRequests ?? 0,
          total: rightsStats?.totalRequests ?? 0,
          completed: rightsStats?.completedRequests ?? 0,
          category: 'rights',
        },
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  async getAlerts(token?: string): Promise<any> {
    this.logger.debug('Fetching critical alerts from all services');

    const [
      breachStats,
      privacyRiskStats,
      vendorRiskStats,
      retentionStats,
      rightsStats,
      complianceStats,
    ] = await Promise.all([
      this.serviceClient.getBreachStats(token),
      this.serviceClient.getPrivacyRiskStats(token),
      this.serviceClient.getVendorRiskStats(token),
      this.serviceClient.getRetentionStats(token),
      this.serviceClient.getRightsStats(token),
      this.serviceClient.getComplianceStats(token),
    ]);

    const alerts: any[] = [];

    if ((breachStats?.openBreaches ?? 0) > 0) {
      alerts.push({
        id: 'alert-breach-open',
        severity: 'critical',
        category: 'breach',
        title: 'Open Data Breaches',
        message: `There are ${breachStats.openBreaches} unresolved data breaches requiring immediate attention.`,
        count: breachStats.openBreaches,
        timestamp: new Date().toISOString(),
      });
    }

    if ((privacyRiskStats?.highRisks ?? 0) > 0) {
      alerts.push({
        id: 'alert-risk-high',
        severity: 'high',
        category: 'risk',
        title: 'High Privacy Risks',
        message: `${privacyRiskStats.highRisks} high-severity privacy risks identified.`,
        count: privacyRiskStats.highRisks,
        timestamp: new Date().toISOString(),
      });
    }

    if ((vendorRiskStats?.highRiskVendors ?? 0) > 0) {
      alerts.push({
        id: 'alert-vendor-risk',
        severity: 'high',
        category: 'vendor',
        title: 'High-Risk Vendors',
        message: `${vendorRiskStats.highRiskVendors} vendors flagged as high risk.`,
        count: vendorRiskStats.highRiskVendors,
        timestamp: new Date().toISOString(),
      });
    }

    if ((retentionStats?.overdue ?? 0) > 0) {
      alerts.push({
        id: 'alert-retention-overdue',
        severity: 'warning',
        category: 'retention',
        title: 'Overdue Retention Policies',
        message: `${retentionStats.overdue} data retention policies are overdue.`,
        count: retentionStats.overdue,
        timestamp: new Date().toISOString(),
      });
    }

    if ((rightsStats?.pendingRequests ?? 0) > 5) {
      alerts.push({
        id: 'alert-rights-pending',
        severity: 'warning',
        category: 'rights',
        title: 'Pending DSR Requests',
        message: `${rightsStats.pendingRequests} data subject requests are pending.`,
        count: rightsStats.pendingRequests,
        timestamp: new Date().toISOString(),
      });
    }

    if ((complianceStats?.gaps ?? 0) > 0) {
      alerts.push({
        id: 'alert-compliance-gaps',
        severity: 'warning',
        category: 'compliance',
        title: 'Compliance Gaps',
        message: `${complianceStats.gaps} compliance gaps detected across frameworks.`,
        count: complianceStats.gaps,
        timestamp: new Date().toISOString(),
      });
    }

    alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, warning: 2, info: 3 };
      return (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4);
    });

    return {
      alerts,
      totalAlerts: alerts.length,
      generatedAt: new Date().toISOString(),
    };
  }
}
