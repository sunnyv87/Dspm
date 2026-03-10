import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class DspmClientService {
  private readonly logger = new Logger(DspmClientService.name);
  private readonly httpClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const dspmAdapterUrl =
      this.configService.get<string>('dspm.dspmAdapterUrl') ||
      'http://localhost:3005';

    this.httpClient = axios.create({
      baseURL: dspmAdapterUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async fetchClassificationResults(
    tenantId: string,
  ): Promise<any[]> {
    try {
      const response = await this.httpClient.get(
        '/api/v1/dspm/classification/results',
        {
          headers: { 'X-Tenant-Id': tenantId },
        },
      );
      return response.data?.results || response.data || [];
    } catch (error) {
      this.logger.warn(
        `Failed to fetch classification results from DSPM adapter: ${(error as Error).message}`,
      );
      return [];
    }
  }

  async fetchClassificationRules(): Promise<any[]> {
    try {
      const response = await this.httpClient.get(
        '/api/v1/dspm/classification/rules',
      );
      return response.data?.rules || response.data || [];
    } catch (error) {
      this.logger.warn(
        `Failed to fetch classification rules from DSPM adapter: ${(error as Error).message}`,
      );
      return [];
    }
  }
}
