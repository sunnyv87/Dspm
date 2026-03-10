import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { AuditEntry } from '../../entities/audit-entry.entity';
import { AuditRetentionPolicy } from '../../entities/audit-retention.entity';
import { OpenSearchService } from '../opensearch/opensearch.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditEntry)
    private auditRepo: Repository<AuditEntry>,
    @InjectRepository(AuditRetentionPolicy)
    private retentionRepo: Repository<AuditRetentionPolicy>,
    private openSearchService: OpenSearchService,
  ) {}

  async createEntry(data: Partial<AuditEntry>): Promise<AuditEntry> {
    const entry = this.auditRepo.create(data);
    const saved = await this.auditRepo.save(entry);
    await this.openSearchService.indexEntry(saved);
    return saved;
  }

  async findByTenant(
    tenantId: string,
    params: {
      page?: number;
      pageSize?: number;
      action?: string;
      entityType?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 50;
    const where: any = { tenantId };

    if (params.action) where.action = params.action;
    if (params.entityType) where.entityType = params.entityType;
    if (params.userId) where.userId = params.userId;
    if (params.startDate && params.endDate) {
      where.timestamp = Between(
        new Date(params.startDate),
        new Date(params.endDate),
      );
    }

    const [data, total] = await this.auditRepo.findAndCount({
      where,
      order: { timestamp: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      meta: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async search(
    tenantId: string,
    query: string,
    filters?: Record<string, any>,
  ) {
    return this.openSearchService.search({ tenantId, query, filters });
  }

  async exportEntries(
    tenantId: string,
    startDate: string,
    endDate: string,
    format: 'json' | 'csv',
  ) {
    const entries = await this.auditRepo.find({
      where: {
        tenantId,
        timestamp: Between(new Date(startDate), new Date(endDate)),
      },
      order: { timestamp: 'ASC' },
    });

    if (format === 'csv') {
      const headers =
        'id,tenantId,userId,action,entityType,entityId,ipAddress,severity,timestamp\n';
      const rows = entries
        .map(
          (e) =>
            `${e.id},${e.tenantId},${e.userId},${e.action},${e.entityType},${e.entityId},${e.ipAddress},${e.severity},${e.timestamp}`,
        )
        .join('\n');
      return headers + rows;
    }

    return entries;
  }

  async applyRetention() {
    const policies = await this.retentionRepo.find();
    for (const policy of policies) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - policy.retentionDays);
      const result = await this.auditRepo.delete({
        tenantId: policy.tenantId,
        timestamp: LessThan(cutoff),
      });
      this.logger.log(
        `Retention: deleted ${result.affected} entries for tenant ${policy.tenantId}`,
      );
    }
  }
}
