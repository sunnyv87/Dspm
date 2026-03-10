import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ConsentRecord, ConsentStatus } from '../../entities/consent-record.entity';
import { ConsentPurpose } from '../../entities/consent-purpose.entity';
import { PolicyVersion } from '../../entities/policy-version.entity';
import { KafkaService } from '../../common/kafka/kafka.service';
import { CaptureConsentDto } from './dto/capture-consent.dto';
import { WithdrawConsentDto } from './dto/withdraw-consent.dto';
import { QueryConsentDto } from './dto/query-consent.dto';

@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);

  constructor(
    @InjectRepository(ConsentRecord)
    private readonly consentRepository: Repository<ConsentRecord>,
    @InjectRepository(ConsentPurpose)
    private readonly purposeRepository: Repository<ConsentPurpose>,
    @InjectRepository(PolicyVersion)
    private readonly policyRepository: Repository<PolicyVersion>,
    private readonly kafkaService: KafkaService,
  ) {}

  async captureConsent(dto: CaptureConsentDto): Promise<ConsentRecord> {
    const tenantId = dto.tenantId;

    // Verify purpose exists and belongs to tenant
    const purpose = await this.purposeRepository.findOne({
      where: { id: dto.purposeId, tenantId },
    });

    if (!purpose) {
      throw new NotFoundException(`Purpose with ID "${dto.purposeId}" not found`);
    }

    if (!purpose.isActive) {
      throw new BadRequestException(`Purpose "${dto.purposeId}" is not active`);
    }

    // Verify policy version exists and belongs to tenant
    const policyVersion = await this.policyRepository.findOne({
      where: { id: dto.policyVersionId, tenantId },
    });

    if (!policyVersion) {
      throw new NotFoundException(`Policy version with ID "${dto.policyVersionId}" not found`);
    }

    const now = new Date();

    // Compute proof hash
    const proofHash = this.computeProofHash(
      dto.dataSubjectId,
      dto.purposeId,
      dto.policyVersionId,
      ConsentStatus.GRANTED,
      now.toISOString(),
      dto.ipAddress || '',
    );

    const record = this.consentRepository.create({
      tenantId,
      dataSubjectId: dto.dataSubjectId,
      dataSubjectEmail: dto.dataSubjectEmail || null,
      dataSubjectExternalId: dto.dataSubjectExternalId || null,
      purposeId: dto.purposeId,
      policyVersionId: dto.policyVersionId,
      status: ConsentStatus.GRANTED,
      consentedAt: now,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      collectionMethod: dto.collectionMethod,
      collectionContext: dto.collectionContext || null,
      ipAddress: dto.ipAddress || null,
      userAgent: dto.userAgent || null,
      deviceInfo: dto.deviceInfo || null,
      proofHash,
      granularity: dto.granularity || null,
      source: dto.source || null,
      isMinor: dto.isMinor || false,
      guardianConsentId: dto.guardianConsentId || null,
    });

    const saved = await this.consentRepository.save(record);

    // Emit Kafka event (fire-and-forget)
    this.emitConsentEvent(tenantId, 'consent.granted', saved).catch((err) =>
      this.logger.warn(`Failed to emit consent.granted event: ${err.message}`),
    );

    this.logger.log(
      `Captured consent for subject "${dto.dataSubjectId}" purpose "${dto.purposeId}" in tenant ${tenantId}`,
    );

    return saved;
  }

  async withdrawConsent(dto: WithdrawConsentDto): Promise<ConsentRecord> {
    const tenantId = dto.tenantId;

    const record = await this.consentRepository.findOne({
      where: { id: dto.consentRecordId, tenantId },
    });

    if (!record) {
      throw new NotFoundException(`Consent record with ID "${dto.consentRecordId}" not found`);
    }

    if (record.status === ConsentStatus.WITHDRAWN) {
      throw new BadRequestException('Consent has already been withdrawn');
    }

    record.status = ConsentStatus.WITHDRAWN;
    record.withdrawnAt = new Date();

    const saved = await this.consentRepository.save(record);

    // Emit Kafka event (fire-and-forget)
    this.emitConsentEvent(tenantId, 'consent.withdrawn', saved).catch((err) =>
      this.logger.warn(`Failed to emit consent.withdrawn event: ${err.message}`),
    );

    this.logger.log(
      `Withdrew consent "${dto.consentRecordId}" for subject "${record.dataSubjectId}" in tenant ${tenantId}`,
    );

    return saved;
  }

  async getSubjectConsents(
    tenantId: string,
    subjectId: string,
  ): Promise<ConsentRecord[]> {
    return this.consentRepository.find({
      where: { tenantId, dataSubjectId: subjectId },
      relations: ['purpose', 'policyVersion'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAuditTrail(
    tenantId: string,
    subjectId: string,
  ): Promise<ConsentRecord[]> {
    return this.consentRepository.find({
      where: { tenantId, dataSubjectId: subjectId },
      relations: ['purpose', 'policyVersion'],
      order: { createdAt: 'ASC' },
    });
  }

  async listRecords(
    tenantId: string,
    query: QueryConsentDto,
  ): Promise<{ data: ConsentRecord[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.consentRepository
      .createQueryBuilder('consent')
      .leftJoinAndSelect('consent.purpose', 'purpose')
      .leftJoinAndSelect('consent.policyVersion', 'policyVersion')
      .where('consent.tenantId = :tenantId', { tenantId });

    if (query.dataSubjectId) {
      qb.andWhere('consent.dataSubjectId = :dataSubjectId', {
        dataSubjectId: query.dataSubjectId,
      });
    }

    if (query.status) {
      qb.andWhere('consent.status = :status', { status: query.status });
    }

    if (query.purposeId) {
      qb.andWhere('consent.purposeId = :purposeId', { purposeId: query.purposeId });
    }

    if (query.collectionMethod) {
      qb.andWhere('consent.collectionMethod = :collectionMethod', {
        collectionMethod: query.collectionMethod,
      });
    }

    if (query.dateFrom) {
      qb.andWhere('consent.createdAt >= :dateFrom', { dateFrom: new Date(query.dateFrom) });
    }

    if (query.dateTo) {
      qb.andWhere('consent.createdAt <= :dateTo', { dateTo: new Date(query.dateTo) });
    }

    qb.orderBy('consent.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<ConsentRecord> {
    const record = await this.consentRepository.findOne({
      where: { id, tenantId },
      relations: ['purpose', 'policyVersion'],
    });

    if (!record) {
      throw new NotFoundException(`Consent record with ID "${id}" not found`);
    }

    return record;
  }

  async getStats(tenantId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPurpose: { purposeId: string; purposeName: string; count: number }[];
    complianceRate: number;
  }> {
    // Total count
    const total = await this.consentRepository.count({ where: { tenantId } });

    // By status
    const statusResults = await this.consentRepository
      .createQueryBuilder('consent')
      .select('consent.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('consent.tenantId = :tenantId', { tenantId })
      .groupBy('consent.status')
      .getRawMany();

    const byStatus: Record<string, number> = {};
    for (const row of statusResults) {
      byStatus[row.status] = parseInt(row.count, 10);
    }

    // By purpose
    const purposeResults = await this.consentRepository
      .createQueryBuilder('consent')
      .leftJoin('consent.purpose', 'purpose')
      .select('consent.purposeId', 'purposeId')
      .addSelect('purpose.name', 'purposeName')
      .addSelect('COUNT(*)', 'count')
      .where('consent.tenantId = :tenantId', { tenantId })
      .groupBy('consent.purposeId')
      .addGroupBy('purpose.name')
      .getRawMany();

    const byPurpose = purposeResults.map((row) => ({
      purposeId: row.purposeId,
      purposeName: row.purposeName,
      count: parseInt(row.count, 10),
    }));

    // Compliance rate: granted / (granted + refused + withdrawn)
    const grantedCount = byStatus[ConsentStatus.GRANTED] || 0;
    const totalDecided =
      grantedCount +
      (byStatus[ConsentStatus.REFUSED] || 0) +
      (byStatus[ConsentStatus.WITHDRAWN] || 0);
    const complianceRate = totalDecided > 0 ? (grantedCount / totalDecided) * 100 : 0;

    return {
      total,
      byStatus,
      byPurpose,
      complianceRate: Math.round(complianceRate * 100) / 100,
    };
  }

  private computeProofHash(
    subjectId: string,
    purposeId: string,
    policyVersionId: string,
    status: string,
    timestamp: string,
    ipAddress: string,
  ): string {
    const data = `${subjectId}${purposeId}${policyVersionId}${status}${timestamp}${ipAddress}`;
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  private async emitConsentEvent(
    tenantId: string,
    eventType: string,
    record: ConsentRecord,
  ): Promise<void> {
    await this.kafkaService.emit('consent.events', {
      key: record.id,
      value: {
        tenantId,
        eventType,
        entityId: record.id,
        timestamp: new Date().toISOString(),
        payload: {
          consentRecordId: record.id,
          dataSubjectId: record.dataSubjectId,
          purposeId: record.purposeId,
          policyVersionId: record.policyVersionId,
          status: record.status,
          collectionMethod: record.collectionMethod,
          consentedAt: record.consentedAt,
          withdrawnAt: record.withdrawnAt,
        },
      },
    });
  }
}
