import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskFinding, FindingStatus } from '../../entities/risk-finding.entity';
import { Vendor } from '../../entities/vendor.entity';
import { VendorAssessment } from '../../entities/vendor-assessment.entity';
import { CreateFindingDto } from './dto/create-finding.dto';
import { QueryFindingDto } from './dto/query-finding.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class FindingService {
  private readonly logger = new Logger(FindingService.name);

  constructor(
    @InjectRepository(RiskFinding)
    private readonly findingRepository: Repository<RiskFinding>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorAssessment)
    private readonly assessmentRepository: Repository<VendorAssessment>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateFindingDto,
  ): Promise<RiskFinding> {
    const vendor = await this.vendorRepository.findOne({
      where: { id: dto.vendorId, tenantId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID "${dto.vendorId}" not found`);
    }

    if (dto.assessmentId) {
      const assessment = await this.assessmentRepository.findOne({
        where: { id: dto.assessmentId, tenantId },
      });
      if (!assessment) {
        throw new NotFoundException(`Assessment with ID "${dto.assessmentId}" not found`);
      }
    }

    const finding = this.findingRepository.create({
      tenantId,
      vendorId: dto.vendorId,
      assessmentId: dto.assessmentId || null,
      title: dto.title,
      description: dto.description || null,
      category: dto.category || null,
      severity: dto.severity,
      status: FindingStatus.OPEN,
      remediationPlan: dto.remediationPlan || null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    });

    const saved = await this.findingRepository.save(finding);
    this.logger.log(`Created finding "${saved.title}" (${saved.id}) for vendor ${dto.vendorId} in tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.finding.created', {
      key: saved.id,
      value: { eventType: 'FINDING_CREATED', tenantId, findingId: saved.id, vendorId: dto.vendorId, severity: saved.severity, title: saved.title, timestamp: new Date().toISOString() },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryFindingDto,
  ): Promise<{ data: RiskFinding[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.findingRepository
      .createQueryBuilder('finding')
      .leftJoinAndSelect('finding.vendor', 'vendor')
      .where('finding.tenantId = :tenantId', { tenantId });

    if (query.vendorId) {
      qb.andWhere('finding.vendorId = :vendorId', { vendorId: query.vendorId });
    }

    if (query.assessmentId) {
      qb.andWhere('finding.assessmentId = :assessmentId', { assessmentId: query.assessmentId });
    }

    if (query.severity) {
      qb.andWhere('finding.severity = :severity', { severity: query.severity });
    }

    if (query.status) {
      qb.andWhere('finding.status = :status', { status: query.status });
    }

    if (query.category) {
      qb.andWhere('finding.category = :category', { category: query.category });
    }

    if (query.search) {
      qb.andWhere('(finding.title ILIKE :search OR finding.description ILIKE :search)', {
        search: `%${query.search.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`,
      });
    }

    qb.orderBy('finding.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<RiskFinding> {
    const finding = await this.findingRepository.findOne({
      where: { id, tenantId },
      relations: ['vendor', 'assessment'],
    });

    if (!finding) {
      throw new NotFoundException(`Finding with ID "${id}" not found`);
    }

    return finding;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: FindingStatus,
    remediationPlan?: string,
  ): Promise<RiskFinding> {
    const finding = await this.findById(tenantId, id);

    finding.status = status;
    if (remediationPlan !== undefined) {
      finding.remediationPlan = remediationPlan;
    }

    if ([FindingStatus.MITIGATED, FindingStatus.CLOSED].includes(status)) {
      finding.resolvedAt = new Date();
    }

    const saved = await this.findingRepository.save(finding);
    this.logger.log(`Updated finding (${saved.id}) status to ${status} for tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.finding.updated', {
      key: saved.id,
      value: { eventType: 'FINDING_STATUS_CHANGED', tenantId, findingId: saved.id, vendorId: saved.vendorId, status, severity: saved.severity, timestamp: new Date().toISOString() },
    });

    return saved;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const finding = await this.findById(tenantId, id);
    await this.findingRepository.remove(finding);
    this.logger.log(`Deleted finding (${id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.finding.deleted', {
      key: id,
      value: { eventType: 'FINDING_DELETED', tenantId, findingId: id, vendorId: finding.vendorId, timestamp: new Date().toISOString() },
    });
  }
}
