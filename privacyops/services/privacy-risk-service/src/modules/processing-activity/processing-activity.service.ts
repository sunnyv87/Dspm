import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProcessingActivity,
  ProcessingActivityStatus,
} from '../../entities/processing-activity.entity';
import { CreateProcessingActivityDto } from './dto/create-processing-activity.dto';
import { UpdateProcessingActivityDto } from './dto/update-processing-activity.dto';
import { QueryProcessingActivityDto } from './dto/query-processing-activity.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class ProcessingActivityService {
  private readonly logger = new Logger(ProcessingActivityService.name);

  constructor(
    @InjectRepository(ProcessingActivity)
    private readonly repository: Repository<ProcessingActivity>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    dto: CreateProcessingActivityDto,
  ): Promise<ProcessingActivity> {
    const entity = this.repository.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });
    const saved = await this.repository.save(entity);

    await this.kafkaService.emit('privacy-risk.processing-activity.created', {
      key: saved.id,
      value: { id: saved.id, tenantId, name: saved.name, createdBy: userId },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryProcessingActivityDto,
  ): Promise<{ data: ProcessingActivity[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, department, status, lawfulBasis, crossBorderTransfer, search } = query;

    const qb = this.repository
      .createQueryBuilder('pa')
      .where('pa.tenantId = :tenantId', { tenantId });

    if (department) {
      qb.andWhere('pa.department = :department', { department });
    }
    if (status) {
      qb.andWhere('pa.status = :status', { status });
    }
    if (lawfulBasis) {
      qb.andWhere('pa.lawfulBasis = :lawfulBasis', { lawfulBasis });
    }
    if (crossBorderTransfer !== undefined) {
      qb.andWhere('pa.crossBorderTransfer = :crossBorderTransfer', { crossBorderTransfer });
    }
    if (search) {
      qb.andWhere('(pa.name ILIKE :search OR pa.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('pa.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string): Promise<ProcessingActivity> {
    const entity = await this.repository.findOne({
      where: { id, tenantId },
    });
    if (!entity) {
      throw new NotFoundException(`Processing activity ${id} not found`);
    }
    return entity;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateProcessingActivityDto,
  ): Promise<ProcessingActivity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, dto);
    const saved = await this.repository.save(entity);

    await this.kafkaService.emit('privacy-risk.processing-activity.updated', {
      key: saved.id,
      value: { id: saved.id, tenantId, changes: Object.keys(dto) },
    });

    return saved;
  }

  async archive(tenantId: string, id: string): Promise<ProcessingActivity> {
    const entity = await this.findOne(tenantId, id);
    entity.status = ProcessingActivityStatus.ARCHIVED;
    const saved = await this.repository.save(entity);

    await this.kafkaService.emit('privacy-risk.processing-activity.archived', {
      key: saved.id,
      value: { id: saved.id, tenantId },
    });

    return saved;
  }

  async getStats(tenantId: string): Promise<Record<string, any>> {
    const total = await this.repository.count({ where: { tenantId } });

    const byStatus = await this.repository
      .createQueryBuilder('pa')
      .select('pa.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('pa.tenantId = :tenantId', { tenantId })
      .groupBy('pa.status')
      .getRawMany();

    const byLawfulBasis = await this.repository
      .createQueryBuilder('pa')
      .select('pa.lawfulBasis', 'lawfulBasis')
      .addSelect('COUNT(*)', 'count')
      .where('pa.tenantId = :tenantId', { tenantId })
      .groupBy('pa.lawfulBasis')
      .getRawMany();

    const crossBorderCount = await this.repository.count({
      where: { tenantId, crossBorderTransfer: true },
    });

    const dpiaRequiredCount = await this.repository.count({
      where: { tenantId, dpiaRequired: true },
    });

    return {
      total,
      byStatus,
      byLawfulBasis,
      crossBorderCount,
      dpiaRequiredCount,
    };
  }
}
