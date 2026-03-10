import { Injectable, Logger } from '@nestjs/common';
import { ServiceClientService } from '../service-client/service-client.service';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private readonly serviceClient: ServiceClientService) {}

  async getRecent(token?: string): Promise<any> {
    this.logger.debug('Fetching recent activity');

    const entries = await this.serviceClient.getRecentAuditEntries(token, 20);

    return {
      entries: Array.isArray(entries) ? entries : [],
      total: Array.isArray(entries) ? entries.length : 0,
      generatedAt: new Date().toISOString(),
    };
  }

  async getTimeline(token?: string): Promise<any> {
    this.logger.debug('Fetching activity timeline');

    const timeline = await this.serviceClient.getAuditTimeline(token, 30);

    return {
      timeline: Array.isArray(timeline) ? timeline : [],
      periodDays: 30,
      generatedAt: new Date().toISOString(),
    };
  }

  async getUserActivity(userId: string, token?: string): Promise<any> {
    this.logger.debug(`Fetching activity for user ${userId}`);

    const entries = await this.serviceClient.getAuditByUser(userId, token);

    return {
      userId,
      entries: Array.isArray(entries) ? entries : [],
      total: Array.isArray(entries) ? entries.length : 0,
      generatedAt: new Date().toISOString(),
    };
  }
}
