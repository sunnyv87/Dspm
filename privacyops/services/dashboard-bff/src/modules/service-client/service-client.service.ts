import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class ServiceClientService {
  private readonly logger = new Logger(ServiceClientService.name);

  private readonly discoveryUrl: string;
  private readonly consentUrl: string;
  private readonly auditUrl: string;
  private readonly classificationUrl: string;
  private readonly privacyRiskUrl: string;
  private readonly vendorRiskUrl: string;
  private readonly breachUrl: string;
  private readonly complianceAiUrl: string;
  private readonly rightsUrl: string;
  private readonly retentionUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.discoveryUrl = this.configService.get<string>('services.discoveryUrl');
    this.consentUrl = this.configService.get<string>('services.consentUrl');
    this.auditUrl = this.configService.get<string>('services.auditUrl');
    this.classificationUrl = this.configService.get<string>('services.classificationUrl');
    this.privacyRiskUrl = this.configService.get<string>('services.privacyRiskUrl');
    this.vendorRiskUrl = this.configService.get<string>('services.vendorRiskUrl');
    this.breachUrl = this.configService.get<string>('services.breachUrl');
    this.complianceAiUrl = this.configService.get<string>('services.complianceAiUrl');
    this.rightsUrl = this.configService.get<string>('services.rightsUrl');
    this.retentionUrl = this.configService.get<string>('services.retentionUrl');
  }

  private buildConfig(token?: string): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      headers: {},
    };
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }

  private async safeGet<T>(url: string, token?: string, defaultValue?: T): Promise<T | null> {
    try {
      const config = this.buildConfig(token);
      const response = await firstValueFrom(
        this.httpService.get<T>(url, config),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(`Failed to fetch from ${url}: ${error.message}`);
      return defaultValue ?? null;
    }
  }

  async getDiscoveryStats(token?: string): Promise<any> {
    return this.safeGet(
      `${this.discoveryUrl}/api/v1/discovery/stats`,
      token,
      { totalAssets: 0, newAssets: 0, scanStatus: 'unknown' },
    );
  }

  async getClassificationStats(token?: string): Promise<any> {
    return this.safeGet(
      `${this.classificationUrl}/api/v1/classification/stats`,
      token,
      { totalClassified: 0, pendingClassification: 0, categories: [] },
    );
  }

  async getConsentStats(token?: string): Promise<any> {
    return this.safeGet(
      `${this.consentUrl}/api/v1/consent/stats`,
      token,
      { totalConsents: 0, activeConsents: 0, expiredConsents: 0 },
    );
  }

  async getBreachStats(token?: string): Promise<any> {
    return this.safeGet(
      `${this.breachUrl}/api/v1/breach/stats`,
      token,
      { totalBreaches: 0, openBreaches: 0, resolvedBreaches: 0, severity: {} },
    );
  }

  async getVendorRiskStats(token?: string): Promise<any> {
    return this.safeGet(
      `${this.vendorRiskUrl}/api/v1/vendor-risk/stats`,
      token,
      { totalVendors: 0, highRiskVendors: 0, assessmentsDue: 0 },
    );
  }

  async getPrivacyRiskStats(token?: string): Promise<any> {
    return this.safeGet(
      `${this.privacyRiskUrl}/api/v1/privacy-risk/stats`,
      token,
      { totalRisks: 0, highRisks: 0, mediumRisks: 0, lowRisks: 0, riskScore: 0 },
    );
  }

  async getComplianceStats(token?: string): Promise<any> {
    return this.safeGet(
      `${this.complianceAiUrl}/api/v1/compliance/stats`,
      token,
      { overallScore: 0, frameworks: [], gaps: 0 },
    );
  }

  async getComplianceFrameworks(token?: string): Promise<any> {
    return this.safeGet(
      `${this.complianceAiUrl}/api/v1/compliance/frameworks`,
      token,
      [],
    );
  }

  async getComplianceTrends(token?: string): Promise<any> {
    return this.safeGet(
      `${this.complianceAiUrl}/api/v1/compliance/trends`,
      token,
      [],
    );
  }

  async getRightsStats(token?: string): Promise<any> {
    return this.safeGet(
      `${this.rightsUrl}/api/v1/rights/stats`,
      token,
      { totalRequests: 0, pendingRequests: 0, completedRequests: 0 },
    );
  }

  async getRetentionStats(token?: string): Promise<any> {
    return this.safeGet(
      `${this.retentionUrl}/api/v1/retention/stats`,
      token,
      { totalPolicies: 0, expiringSoon: 0, overdue: 0 },
    );
  }

  async getRecentAuditEntries(token?: string, limit = 20): Promise<any> {
    return this.safeGet(
      `${this.auditUrl}/api/v1/audit/entries?limit=${limit}&sort=desc`,
      token,
      [],
    );
  }

  async getAuditTimeline(token?: string, days = 30): Promise<any> {
    return this.safeGet(
      `${this.auditUrl}/api/v1/audit/timeline?days=${days}`,
      token,
      [],
    );
  }

  async getAuditByUser(userId: string, token?: string): Promise<any> {
    return this.safeGet(
      `${this.auditUrl}/api/v1/audit/entries?userId=${userId}`,
      token,
      [],
    );
  }

  async getRiskHeatmap(token?: string): Promise<any> {
    return this.safeGet(
      `${this.privacyRiskUrl}/api/v1/privacy-risk/heatmap`,
      token,
      { cells: [], categories: [], impacts: [] },
    );
  }

  async getRiskTrends(token?: string): Promise<any> {
    return this.safeGet(
      `${this.privacyRiskUrl}/api/v1/privacy-risk/trends`,
      token,
      [],
    );
  }
}
