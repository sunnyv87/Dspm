import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorQuestionnaire, QuestionnaireStatus } from '../../entities/vendor-questionnaire.entity';
import { Vendor } from '../../entities/vendor.entity';
import { VendorAssessment } from '../../entities/vendor-assessment.entity';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class QuestionnaireService {
  private readonly logger = new Logger(QuestionnaireService.name);

  constructor(
    @InjectRepository(VendorQuestionnaire)
    private readonly questionnaireRepository: Repository<VendorQuestionnaire>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorAssessment)
    private readonly assessmentRepository: Repository<VendorAssessment>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateQuestionnaireDto,
  ): Promise<VendorQuestionnaire> {
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

    const questionnaire = this.questionnaireRepository.create({
      tenantId,
      vendorId: dto.vendorId,
      assessmentId: dto.assessmentId || null,
      templateName: dto.templateName,
      version: dto.version || '1.0',
      status: QuestionnaireStatus.DRAFT,
      questions: dto.questions || [],
      responses: [],
    });

    const saved = await this.questionnaireRepository.save(questionnaire);
    this.logger.log(`Created questionnaire (${saved.id}) for vendor ${dto.vendorId} in tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.questionnaire.created', {
      key: saved.id,
      value: { eventType: 'QUESTIONNAIRE_CREATED', tenantId, questionnaireId: saved.id, vendorId: dto.vendorId, templateName: saved.templateName, timestamp: new Date().toISOString() },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    vendorId?: string,
    assessmentId?: string,
    status?: QuestionnaireStatus,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: VendorQuestionnaire[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const qb = this.questionnaireRepository
      .createQueryBuilder('questionnaire')
      .leftJoinAndSelect('questionnaire.vendor', 'vendor')
      .where('questionnaire.tenantId = :tenantId', { tenantId });

    if (vendorId) {
      qb.andWhere('questionnaire.vendorId = :vendorId', { vendorId });
    }

    if (assessmentId) {
      qb.andWhere('questionnaire.assessmentId = :assessmentId', { assessmentId });
    }

    if (status) {
      qb.andWhere('questionnaire.status = :status', { status });
    }

    qb.orderBy('questionnaire.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<VendorQuestionnaire> {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id, tenantId },
      relations: ['vendor', 'assessment'],
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID "${id}" not found`);
    }

    return questionnaire;
  }

  async send(tenantId: string, id: string): Promise<VendorQuestionnaire> {
    const questionnaire = await this.findById(tenantId, id);

    if (questionnaire.status !== QuestionnaireStatus.DRAFT) {
      throw new BadRequestException('Questionnaire can only be sent from DRAFT status');
    }

    questionnaire.status = QuestionnaireStatus.SENT;
    questionnaire.sentAt = new Date();

    const saved = await this.questionnaireRepository.save(questionnaire);
    this.logger.log(`Sent questionnaire (${saved.id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.questionnaire.sent', {
      key: saved.id,
      value: { eventType: 'QUESTIONNAIRE_SENT', tenantId, questionnaireId: saved.id, vendorId: saved.vendorId, timestamp: new Date().toISOString() },
    });

    return saved;
  }

  async submitResponses(
    tenantId: string,
    id: string,
    dto: SubmitResponseDto,
  ): Promise<VendorQuestionnaire> {
    const questionnaire = await this.findById(tenantId, id);

    if (![QuestionnaireStatus.SENT, QuestionnaireStatus.IN_PROGRESS].includes(questionnaire.status)) {
      throw new BadRequestException('Questionnaire must be in SENT or IN_PROGRESS status to submit responses');
    }

    questionnaire.responses = dto.responses;
    questionnaire.status = QuestionnaireStatus.SUBMITTED;
    questionnaire.submittedAt = new Date();

    const saved = await this.questionnaireRepository.save(questionnaire);
    this.logger.log(`Responses submitted for questionnaire (${saved.id}) in tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.questionnaire.submitted', {
      key: saved.id,
      value: { eventType: 'QUESTIONNAIRE_SUBMITTED', tenantId, questionnaireId: saved.id, vendorId: saved.vendorId, timestamp: new Date().toISOString() },
    });

    return saved;
  }

  async markReviewed(tenantId: string, id: string): Promise<VendorQuestionnaire> {
    const questionnaire = await this.findById(tenantId, id);

    if (questionnaire.status !== QuestionnaireStatus.SUBMITTED) {
      throw new BadRequestException('Questionnaire must be in SUBMITTED status to mark as reviewed');
    }

    questionnaire.status = QuestionnaireStatus.REVIEWED;
    questionnaire.reviewedAt = new Date();

    const saved = await this.questionnaireRepository.save(questionnaire);
    this.logger.log(`Questionnaire (${saved.id}) marked as reviewed in tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.questionnaire.reviewed', {
      key: saved.id,
      value: { eventType: 'QUESTIONNAIRE_REVIEWED', tenantId, questionnaireId: saved.id, vendorId: saved.vendorId, timestamp: new Date().toISOString() },
    });

    return saved;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const questionnaire = await this.findById(tenantId, id);
    await this.questionnaireRepository.remove(questionnaire);
    this.logger.log(`Deleted questionnaire (${id}) for tenant ${tenantId}`);
  }
}
