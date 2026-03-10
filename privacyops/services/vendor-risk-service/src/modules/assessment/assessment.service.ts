import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorAssessment, AssessmentStatus } from '../../entities/vendor-assessment.entity';
import { Vendor } from '../../entities/vendor.entity';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { QueryAssessmentDto } from './dto/query-assessment.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class AssessmentService {
  private readonly logger = new Logger(AssessmentService.name);

  constructor(
    @InjectRepository(VendorAssessment)
    private readonly assessmentRepository: Repository<VendorAssessment>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    assessorId: string,
    dto: CreateAssessmentDto,
  ): Promise<VendorAssessment> {
    const vendor = await this.vendorRepository.findOne({
      where: { id: dto.vendorId, tenantId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID "${dto.vendorId}" not found`);
    }

    const assessment = this.assessmentRepository.create({
      tenantId,
      vendorId: dto.vendorId,
      assessorId,
      type: dto.type,
      status: AssessmentStatus.DRAFT,
      overallScore: dto.overallScore || null,
      riskLevel: dto.riskLevel,
      findings: dto.findings || [],
      recommendations: dto.recommendations || [],
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    });

    const saved = await this.assessmentRepository.save(assessment);
    this.logger.log(`Created assessment (${saved.id}) for vendor ${dto.vendorId} in tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.assessment.created', {
      key: saved.id,
      value: { eventType: 'ASSESSMENT_CREATED', tenantId, assessmentId: saved.id, vendorId: dto.vendorId, type: saved.type, timestamp: new Date().toISOString() },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryAssessmentDto,
  ): Promise<{ data: VendorAssessment[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.vendor', 'vendor')
      .where('assessment.tenantId = :tenantId', { tenantId });

    if (query.vendorId) {
      qb.andWhere('assessment.vendorId = :vendorId', { vendorId: query.vendorId });
    }

    if (query.type) {
      qb.andWhere('assessment.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('assessment.status = :status', { status: query.status });
    }

    if (query.riskLevel) {
      qb.andWhere('assessment.riskLevel = :riskLevel', { riskLevel: query.riskLevel });
    }

    qb.orderBy('assessment.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<VendorAssessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id, tenantId },
      relations: ['vendor', 'questionnaires', 'riskFindings'],
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID "${id}" not found`);
    }

    return assessment;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: AssessmentStatus,
    overallScore?: number,
    riskLevel?: string,
  ): Promise<VendorAssessment> {
    const assessment = await this.findById(tenantId, id);

    assessment.status = status;
    if (overallScore !== undefined) {
      assessment.overallScore = overallScore;
    }
    if (riskLevel) {
      assessment.riskLevel = riskLevel as any;
    }

    if (status === AssessmentStatus.COMPLETED) {
      assessment.completedAt = new Date();

      // Update vendor's last assessment date
      await this.vendorRepository.update(
        { id: assessment.vendorId, tenantId },
        { lastAssessmentDate: new Date(), riskLevel: assessment.riskLevel },
      );
    }

    const saved = await this.assessmentRepository.save(assessment);
    this.logger.log(`Updated assessment (${saved.id}) status to ${status} for tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.assessment.updated', {
      key: saved.id,
      value: { eventType: 'ASSESSMENT_STATUS_CHANGED', tenantId, assessmentId: saved.id, vendorId: saved.vendorId, status, timestamp: new Date().toISOString() },
    });

    return saved;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const assessment = await this.findById(tenantId, id);
    await this.assessmentRepository.remove(assessment);
    this.logger.log(`Deleted assessment (${id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.assessment.deleted', {
      key: id,
      value: { eventType: 'ASSESSMENT_DELETED', tenantId, assessmentId: id, vendorId: assessment.vendorId, timestamp: new Date().toISOString() },
    });
  }
}
