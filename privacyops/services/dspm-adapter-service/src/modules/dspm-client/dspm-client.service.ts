import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

@Injectable()
export class DspmClientService implements OnModuleInit {
  private readonly logger = new Logger(DspmClientService.name);
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const baseURL = this.configService.get<string>('dspm.baseUrl');
    const timeout = this.configService.get<number>('dspm.timeout');

    this.client = axios.create({ baseURL, timeout });

    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(`DSPM API error: ${error.response?.status} ${error.config?.url}`);
        throw error;
      },
    );
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  async authenticate(email: string, password: string): Promise<string> {
    const response = await this.client.post('/auth/login', { email, password });
    this.authToken = response.data.access_token;
    return this.authToken;
  }

  // ─── Connectors ─────────────────────────────────────────────────────
  async listConnectors(params?: Record<string, any>) {
    const { data } = await this.client.get('/connectors/', { params });
    return data;
  }

  async getConnector(id: string) {
    const { data } = await this.client.get(`/connectors/${id}`);
    return data;
  }

  async createConnector(payload: Record<string, any>) {
    const { data } = await this.client.post('/connectors/', payload);
    return data;
  }

  async testConnector(payload: Record<string, any>) {
    const { data } = await this.client.post('/connectors/test', payload);
    return data;
  }

  async getConnectorHealth(id: string) {
    const { data } = await this.client.get(`/connectors/${id}/health`);
    return data;
  }

  // ─── Scans ──────────────────────────────────────────────────────────
  async listScans(params?: Record<string, any>) {
    const { data } = await this.client.get('/scans/', { params });
    return data;
  }

  async createScan(payload: Record<string, any>) {
    const { data } = await this.client.post('/scans/', payload);
    return data;
  }

  async getScan(id: string) {
    const { data } = await this.client.get(`/scans/${id}`);
    return data;
  }

  async cancelScan(id: string) {
    const { data } = await this.client.post(`/scans/${id}/cancel`);
    return data;
  }

  // ─── Assets ─────────────────────────────────────────────────────────
  async listAssets(params?: Record<string, any>) {
    const { data } = await this.client.get('/assets/', { params });
    return data;
  }

  async getAsset(id: string) {
    const { data } = await this.client.get(`/assets/${id}`);
    return data;
  }

  // ─── Classification ────────────────────────────────────────────────
  async listClassificationResults(params?: Record<string, any>) {
    const { data } = await this.client.get('/classification/results', { params });
    return data;
  }

  async listClassificationRules(params?: Record<string, any>) {
    const { data } = await this.client.get('/classification/rules', { params });
    return data;
  }

  // ─── Risk ───────────────────────────────────────────────────────────
  async getRiskScores(params?: Record<string, any>) {
    const { data } = await this.client.get('/risk/scores', { params });
    return data;
  }

  async getRiskScore(assetId: string) {
    const { data } = await this.client.get(`/risk/scores/${assetId}`);
    return data;
  }

  // ─── Policies ───────────────────────────────────────────────────────
  async listPolicies(params?: Record<string, any>) {
    const { data } = await this.client.get('/policies/', { params });
    return data;
  }

  async listViolations(params?: Record<string, any>) {
    const { data } = await this.client.get('/policies/violations', { params });
    return data;
  }

  // ─── Alerts ─────────────────────────────────────────────────────────
  async listAlerts(params?: Record<string, any>) {
    const { data } = await this.client.get('/alerts/', { params });
    return data;
  }

  // ─── Identity ───────────────────────────────────────────────────────
  async listIdentityFindings(params?: Record<string, any>) {
    const { data } = await this.client.get('/identity/findings', { params });
    return data;
  }

  // ─── Generic request method ────────────────────────────────────────
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const { data } = await this.client.request(config);
    return data;
  }
}
