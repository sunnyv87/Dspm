import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceFinding } from '../../entities/compliance-finding.entity';
import { QueryFindingDto } from './dto/query-finding.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class FindingService {
  private readonly logger = new Logger(FindingService.name);

  constructor(
    @InjectRepository(ComplianceFinding)
    private readonly findingRepository: Repository<ComplianceFinding>,
    private readonly kafkaService: KafkaService,
  ) {}

  async findAll(
    tenantId: string,
    query: QueryFindingDto,
  ): Promise<{ data: ComplianceFinding[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.findingRepository
      .createQueryBuilder('finding')
      .leftJoinAndSelect('finding.framework', 'framework')
      .leftJoinAndSelect('finding.scan', 'scan')
      .where('finding.tenantId = :tenantId', { tenantId });

    if (query.scanId) {
      qb.andWhere('finding.scanId = :scanId', { scanId: query.scanId });
    }

    if (query.frameworkId) {
      qb.andWhere('finding.frameworkId = :frameworkId', { frameworkId: query.frameworkId });
    }

    if (query.status) {
      qb.andWhere('finding.status = :status', { status: query.status });
    }

    if (query.severity) {
      qb.andWhere('finding.severity = :severity', { severity: query.severity });
    }

    if (query.controlId) {
      qb.andWhere('finding.controlId = :controlId', { controlId: query.controlId });
    }

    if (query.search) {
      qb.andWhere(
        '(finding.controlName ILIKE :search OR finding.description ILIKE :search)',
        { search: `%${query.search.replace(/%/g, '\\%').replace(/_/g, '\\_')}%` },
      );
    }

    qb.orderBy('finding.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<ComplianceFinding> {
    const finding = await this.findingRepository.findOne({
      where: { id, tenantId },
      relations: ['framework', 'scan', 'remediations'],
    });

    if (!finding) {
      throw new NotFoundException(`Finding with ID "${id}" not found`);
    }

    return finding;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateFindingDto,
  ): Promise<ComplianceFinding> {
    const finding = await this.findById(tenantId, id);

    Object.assign(finding, dto);

    const saved = await this.findingRepository.save(finding);

    await this.kafkaService.emit('compliance-ai.finding.updated', {
      key: saved.id,
      value: {
        findingId: saved.id,
        tenantId,
        status: saved.status,
        severity: saved.severity,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Updated finding ${id} for tenant ${tenantId}`);
    return saved;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const finding = await this.findById(tenantId, id);
    await this.findingRepository.remove(finding);
    this.logger.log(`Deleted finding ${id} for tenant ${tenantId}`);
  }

  async getStatsByScan(
    tenantId: string,
    scanId: string,
  ): Promise<{
    total: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    const findings = await this.findingRepository.find({
      where: { tenantId, scanId },
    });

    const byStatus: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const finding of findings) {
      byStatus[finding.status] = (byStatus[finding.status] || 0) + 1;
      bySeverity[finding.severity] = (bySeverity[finding.severity] || 0) + 1;
    }

    return {
      total: findings.length,
      byStatus,
      bySeverity,
    };
  }
}
