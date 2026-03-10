import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RightsRequest, RequestStatus } from '../../entities/rights-request.entity';
import { DataSubject } from '../../entities/data-subject.entity';
import { KafkaService } from '../../common/kafka/kafka.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { QueryRequestDto } from './dto/query-request.dto';

@Injectable()
export class RequestService {
  private readonly logger = new Logger(RequestService.name);

  constructor(
    @InjectRepository(RightsRequest)
    private readonly requestRepository: Repository<RightsRequest>,
    @InjectRepository(DataSubject)
    private readonly subjectRepository: Repository<DataSubject>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateRequestDto,
  ): Promise<RightsRequest> {
    const subject = await this.subjectRepository.findOne({
      where: { id: dto.subjectId, tenantId },
    });

    if (!subject) {
      throw new NotFoundException(`Data subject with ID "${dto.subjectId}" not found`);
    }

    const request = this.requestRepository.create({
      tenantId,
      subjectId: dto.subjectId,
      type: dto.type,
      priority: dto.priority,
      description: dto.description,
      requestedAt: new Date(),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      assignedTo: dto.assignedTo,
      verificationMethod: dto.verificationMethod,
      regulatoryFramework: dto.regulatoryFramework,
      metadata: dto.metadata,
    });

    const saved = await this.requestRepository.save(request);
    this.logger.log(`Created rights request (${saved.id}) type=${saved.type} for tenant ${tenantId}`);

    await this.kafkaService.emit('rights.request.created', {
      key: saved.id,
      value: { tenantId, requestId: saved.id, type: saved.type, subjectId: saved.subjectId },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryRequestDto,
  ): Promise<{ data: RightsRequest[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.subject', 'subject')
      .where('request.tenantId = :tenantId', { tenantId });

    if (query.search) {
      qb.andWhere('request.description ILIKE :search', { search: `%${query.search}%` });
    }

    if (query.subjectId) {
      qb.andWhere('request.subjectId = :subjectId', { subjectId: query.subjectId });
    }

    if (query.type) {
      qb.andWhere('request.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('request.status = :status', { status: query.status });
    }

    if (query.priority) {
      qb.andWhere('request.priority = :priority', { priority: query.priority });
    }

    if (query.assignedTo) {
      qb.andWhere('request.assignedTo = :assignedTo', { assignedTo: query.assignedTo });
    }

    qb.orderBy('request.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<RightsRequest> {
    const request = await this.requestRepository.findOne({
      where: { id, tenantId },
      relations: ['subject', 'tasks'],
    });

    if (!request) {
      throw new NotFoundException(`Rights request with ID "${id}" not found`);
    }

    return request;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateRequestDto,
  ): Promise<RightsRequest> {
    const request = await this.findById(tenantId, id);

    const previousStatus = request.status;

    if (dto.dueDate) {
      (dto as any).dueDate = new Date(dto.dueDate);
    }

    Object.assign(request, dto);

    if (dto.status === RequestStatus.COMPLETED && !request.completedAt) {
      request.completedAt = new Date();
    }

    const saved = await this.requestRepository.save(request);
    this.logger.log(`Updated rights request (${saved.id}) for tenant ${tenantId}`);

    if (dto.status && dto.status !== previousStatus) {
      await this.kafkaService.emit('rights.request.status_changed', {
        key: saved.id,
        value: {
          tenantId,
          requestId: saved.id,
          previousStatus,
          newStatus: dto.status,
        },
      });
    }

    return saved;
  }
}
