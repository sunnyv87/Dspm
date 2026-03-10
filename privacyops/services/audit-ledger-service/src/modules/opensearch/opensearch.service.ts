import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenSearchService implements OnModuleInit {
  private readonly logger = new Logger(OpenSearchService.name);
  private client: any;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const { Client } = await import('@opensearch-project/opensearch');
    this.client = new Client({
      node: this.configService.get('opensearch.node') || 'http://localhost:9200',
      auth: {
        username: this.configService.get('opensearch.username') || 'admin',
        password: this.configService.get('opensearch.password') || 'admin',
      },
      ssl: { rejectUnauthorized: false },
    });
    await this.ensureIndex();
  }

  private async ensureIndex() {
    const indexName = 'audit-entries';
    try {
      const exists = await this.client.indices.exists({ index: indexName });
      if (!exists.body) {
        await this.client.indices.create({
          index: indexName,
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                tenantId: { type: 'keyword' },
                userId: { type: 'keyword' },
                action: { type: 'keyword' },
                entityType: { type: 'keyword' },
                entityId: { type: 'keyword' },
                ipAddress: { type: 'ip' },
                userAgent: { type: 'text' },
                severity: { type: 'keyword' },
                timestamp: { type: 'date' },
                changes: { type: 'object', enabled: false },
                metadata: { type: 'object', enabled: false },
              },
            },
          },
        });
        this.logger.log('Created audit-entries index');
      }
    } catch (err) {
      this.logger.warn('OpenSearch index creation skipped: ' + (err as Error).message);
    }
  }

  async indexEntry(entry: any) {
    try {
      await this.client.index({
        index: 'audit-entries',
        id: entry.id,
        body: entry,
        refresh: false,
      });
    } catch (err) {
      this.logger.error('Failed to index audit entry: ' + (err as Error).message);
    }
  }

  async search(params: {
    tenantId: string;
    query?: string;
    filters?: Record<string, any>;
    from?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const must: any[] = [{ term: { tenantId: params.tenantId } }];

    if (params.query) {
      must.push({
        multi_match: {
          query: params.query,
          fields: ['action', 'entityType', 'userAgent'],
        },
      });
    }

    if (params.filters) {
      for (const [key, value] of Object.entries(params.filters)) {
        must.push({ term: { [key]: value } });
      }
    }

    if (params.startDate || params.endDate) {
      const range: any = { timestamp: {} };
      if (params.startDate) range.timestamp.gte = params.startDate;
      if (params.endDate) range.timestamp.lte = params.endDate;
      must.push({ range });
    }

    const result = await this.client.search({
      index: 'audit-entries',
      body: {
        query: { bool: { must } },
        sort: [{ timestamp: { order: 'desc' } }],
        from: params.from || 0,
        size: params.size || 50,
      },
    });

    return {
      hits: result.body.hits.hits.map((h: any) => h._source),
      total: result.body.hits.total.value,
    };
  }
}
