import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface DspmAsset {
  id: string;
  name: string;
  path?: string;
  type: string;
  sizeBytes?: number;
  sensitivityLevel?: string;
  encryptionStatus?: string;
  exposureStatus?: string;
  containsPersonalData?: boolean;
  sensitivityScore?: number;
  classifications?: string[];
  metadata?: Record<string, any>;
  lastModifiedAt?: string;
  geoRegion?: string;
  riskScore?: number;
}

export interface DspmScanRequest {
  dataSourceId: string;
  tenantId: string;
  syncType: string;
  connectionConfig?: Record<string, any>;
}

export interface DspmScanResponse {
  scanId: string;
  status: string;
  totalAssets?: number;
  processedAssets?: number;
  newAssets?: number;
  updatedAssets?: number;
  errorCount?: number;
  errorDetails?: Record<string, any>;
  startedAt?: string;
  completedAt?: string;
}

export interface DspmConnectorHealthResponse {
  status: string;
  latencyMs?: number;
  message?: string;
  checkedAt: string;
}

@Injectable()
export class DspmClientService {
  private readonly logger = new Logger(DspmClientService.name);
  private readonly httpClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>('dspm.dspmAdapterUrl') || 'http://localhost:3005';
    this.httpClient = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(
          `DSPM adapter request failed: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.message}`,
          error.response?.data ? JSON.stringify(error.response.data) : undefined,
        );
        throw error;
      },
    );
  }

  async fetchAssets(tenantId: string): Promise<DspmAsset[]> {
    this.logger.debug(`Fetching assets from DSPM adapter for tenant ${tenantId}`);
    const response = await this.httpClient.get<{ data: DspmAsset[] }>(
      '/api/v1/dspm/assets',
      { params: { tenantId } },
    );
    return response.data.data || response.data as any;
  }

  async fetchAssetById(id: string): Promise<DspmAsset> {
    this.logger.debug(`Fetching asset ${id} from DSPM adapter`);
    const response = await this.httpClient.get<{ data: DspmAsset }>(
      `/api/v1/dspm/assets/${id}`,
    );
    return response.data.data || response.data as any;
  }

  async triggerScan(data: DspmScanRequest): Promise<DspmScanResponse> {
    this.logger.log(`Triggering DSPM scan for data source ${data.dataSourceId}`);
    const response = await this.httpClient.post<{ data: DspmScanResponse }>(
      '/api/v1/dspm/scans',
      data,
    );
    return response.data.data || response.data as any;
  }

  async getScanStatus(scanId: string): Promise<DspmScanResponse> {
    this.logger.debug(`Getting scan status for ${scanId}`);
    const response = await this.httpClient.get<{ data: DspmScanResponse }>(
      `/api/v1/dspm/scans/${scanId}`,
    );
    return response.data.data || response.data as any;
  }

  async cancelScan(scanId: string): Promise<DspmScanResponse> {
    this.logger.log(`Cancelling scan ${scanId}`);
    const response = await this.httpClient.post<{ data: DspmScanResponse }>(
      `/api/v1/dspm/scans/${scanId}/cancel`,
    );
    return response.data.data || response.data as any;
  }

  async fetchConnectorHealth(connectorId: string): Promise<DspmConnectorHealthResponse> {
    this.logger.debug(`Checking connector health for ${connectorId}`);
    const response = await this.httpClient.get<{ data: DspmConnectorHealthResponse }>(
      `/api/v1/dspm/connectors/${connectorId}/health`,
    );
    return response.data.data || response.data as any;
  }
}
