import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSubject } from '../../entities/data-subject.entity';
import { KafkaService } from '../../common/kafka/kafka.service';
import { RegisterSubjectDto } from './dto/register-subject.dto';
import { QuerySubjectDto } from './dto/query-subject.dto';

@Injectable()
export class SubjectService {
  private readonly logger = new Logger(SubjectService.name);

  constructor(
    @InjectRepository(DataSubject)
    private readonly subjectRepository: Repository<DataSubject>,
    private readonly kafkaService: KafkaService,
  ) {}

  async register(
    tenantId: string,
    dto: RegisterSubjectDto,
  ): Promise<DataSubject> {
    const existing = await this.subjectRepository.findOne({
      where: { tenantId, email: dto.email },
    });

    if (existing) {
      throw new ConflictException(`Data subject with email "${dto.email}" already exists for this tenant`);
    }

    const subject = this.subjectRepository.create({
      tenantId,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      externalId: dto.externalId,
      type: dto.type,
      metadata: dto.metadata,
    });

    const saved = await this.subjectRepository.save(subject);
    this.logger.log(`Registered data subject "${saved.email}" (${saved.id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('rights.subject.registered', {
      key: saved.id,
      value: { tenantId, subjectId: saved.id, email: saved.email },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QuerySubjectDto,
  ): Promise<{ data: DataSubject[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.subjectRepository
      .createQueryBuilder('subject')
      .where('subject.tenantId = :tenantId', { tenantId });

    if (query.search) {
      qb.andWhere(
        '(subject.email ILIKE :search OR subject.firstName ILIKE :search OR subject.lastName ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.type) {
      qb.andWhere('subject.type = :type', { type: query.type });
    }

    qb.orderBy('subject.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<DataSubject> {
    const subject = await this.subjectRepository.findOne({
      where: { id, tenantId },
      relations: ['requests'],
    });

    if (!subject) {
      throw new NotFoundException(`Data subject with ID "${id}" not found`);
    }

    return subject;
  }
}
