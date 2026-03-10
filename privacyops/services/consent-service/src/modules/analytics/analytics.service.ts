import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentRecord } from '../../entities/consent-record.entity';
import { ConsentPurpose } from '../../entities/consent-purpose.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(ConsentRecord)
    private readonly consentRepository: Repository<ConsentRecord>,
    @InjectRepository(ConsentPurpose)
    private readonly purposeRepository: Repository<ConsentPurpose>,
  ) {}

  async getSummary(tenantId: string): Promise<{
    totalRecords: number;
    totalGranted: number;
    totalWithdrawn: number;
    totalExpired: number;
    totalPending: number;
    totalRefused: number;
    activePurposes: number;
    complianceRate: number;
  }> {
    const statusResults = await this.consentRepository
      .createQueryBuilder('consent')
      .select('consent.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('consent.tenantId = :tenantId', { tenantId })
      .groupBy('consent.status')
      .getRawMany();

    const counts: Record<string, number> = {};
    let totalRecords = 0;
    for (const row of statusResults) {
      const c = parseInt(row.count, 10);
      counts[row.status] = c;
      totalRecords += c;
    }

    const totalGranted = counts['granted'] || 0;
    const totalWithdrawn = counts['withdrawn'] || 0;
    const totalExpired = counts['expired'] || 0;
    const totalPending = counts['pending'] || 0;
    const totalRefused = counts['refused'] || 0;

    const activePurposes = await this.purposeRepository.count({
      where: { tenantId, isActive: true },
    });

    const totalDecided = totalGranted + totalRefused + totalWithdrawn;
    const complianceRate = totalDecided > 0
      ? Math.round((totalGranted / totalDecided) * 10000) / 100
      : 0;

    return {
      totalRecords,
      totalGranted,
      totalWithdrawn,
      totalExpired,
      totalPending,
      totalRefused,
      activePurposes,
      complianceRate,
    };
  }

  async getByPurpose(tenantId: string): Promise<{
    purposeId: string;
    purposeName: string;
    granted: number;
    withdrawn: number;
    expired: number;
    pending: number;
    refused: number;
    total: number;
  }[]> {
    const results = await this.consentRepository
      .createQueryBuilder('consent')
      .leftJoin('consent.purpose', 'purpose')
      .select('consent.purposeId', 'purposeId')
      .addSelect('purpose.name', 'purposeName')
      .addSelect('consent.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('consent.tenantId = :tenantId', { tenantId })
      .groupBy('consent.purposeId')
      .addGroupBy('purpose.name')
      .addGroupBy('consent.status')
      .getRawMany();

    // Aggregate by purpose
    const purposeMap = new Map<string, {
      purposeId: string;
      purposeName: string;
      granted: number;
      withdrawn: number;
      expired: number;
      pending: number;
      refused: number;
      total: number;
    }>();

    for (const row of results) {
      const key = row.purposeId;
      if (!purposeMap.has(key)) {
        purposeMap.set(key, {
          purposeId: row.purposeId,
          purposeName: row.purposeName,
          granted: 0,
          withdrawn: 0,
          expired: 0,
          pending: 0,
          refused: 0,
          total: 0,
        });
      }

      const entry = purposeMap.get(key);
      const count = parseInt(row.count, 10);
      entry[row.status as string] = count;
      entry.total += count;
    }

    return Array.from(purposeMap.values());
  }

  async getByChannel(tenantId: string): Promise<{
    collectionMethod: string;
    granted: number;
    withdrawn: number;
    total: number;
  }[]> {
    const results = await this.consentRepository
      .createQueryBuilder('consent')
      .select('consent.collectionMethod', 'collectionMethod')
      .addSelect('consent.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('consent.tenantId = :tenantId', { tenantId })
      .groupBy('consent.collectionMethod')
      .addGroupBy('consent.status')
      .getRawMany();

    // Aggregate by channel
    const channelMap = new Map<string, {
      collectionMethod: string;
      granted: number;
      withdrawn: number;
      total: number;
    }>();

    for (const row of results) {
      const key = row.collectionMethod;
      if (!channelMap.has(key)) {
        channelMap.set(key, {
          collectionMethod: key,
          granted: 0,
          withdrawn: 0,
          total: 0,
        });
      }

      const entry = channelMap.get(key);
      const count = parseInt(row.count, 10);
      if (row.status === 'granted') entry.granted += count;
      if (row.status === 'withdrawn') entry.withdrawn += count;
      entry.total += count;
    }

    return Array.from(channelMap.values());
  }

  async getTrends(
    tenantId: string,
    days: number = 30,
  ): Promise<{
    date: string;
    granted: number;
    withdrawn: number;
  }[]> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const results = await this.consentRepository
      .createQueryBuilder('consent')
      .select("DATE(consent.createdAt)", 'date')
      .addSelect('consent.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('consent.tenantId = :tenantId', { tenantId })
      .andWhere('consent.createdAt >= :dateFrom', { dateFrom })
      .groupBy("DATE(consent.createdAt)")
      .addGroupBy('consent.status')
      .orderBy("DATE(consent.createdAt)", 'ASC')
      .getRawMany();

    // Aggregate by date
    const dateMap = new Map<string, { date: string; granted: number; withdrawn: number }>();

    for (const row of results) {
      const dateStr = row.date instanceof Date
        ? row.date.toISOString().split('T')[0]
        : String(row.date);

      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr, granted: 0, withdrawn: 0 });
      }

      const entry = dateMap.get(dateStr);
      const count = parseInt(row.count, 10);
      if (row.status === 'granted') entry.granted += count;
      if (row.status === 'withdrawn') entry.withdrawn += count;
    }

    return Array.from(dateMap.values());
  }
}
