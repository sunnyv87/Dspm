import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceFramework } from '../../entities/compliance-framework.entity';
import { CreateFrameworkDto } from './dto/create-framework.dto';
import { QueryFrameworkDto } from './dto/query-framework.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class FrameworkService {
  private readonly logger = new Logger(FrameworkService.name);

  constructor(
    @InjectRepository(ComplianceFramework)
    private readonly frameworkRepository: Repository<ComplianceFramework>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateFrameworkDto,
  ): Promise<ComplianceFramework> {
    const existing = await this.frameworkRepository.findOne({
      where: { tenantId, name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Framework "${dto.name}" already exists for this tenant`);
    }

    const framework = this.frameworkRepository.create({
      tenantId,
      name: dto.name,
      version: dto.version || null,
      description: dto.description || null,
      status: dto.status,
      controls: dto.controls || [],
    });

    const saved = await this.frameworkRepository.save(framework);

    await this.kafkaService.emit('compliance-ai.framework.created', {
      key: saved.id,
      value: {
        frameworkId: saved.id,
        tenantId,
        name: saved.name,
        status: saved.status,
        controlCount: saved.controls?.length || 0,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Created framework "${saved.name}" (${saved.id}) for tenant ${tenantId}`);
    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryFrameworkDto,
  ): Promise<{ data: ComplianceFramework[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.frameworkRepository
      .createQueryBuilder('framework')
      .where('framework.tenantId = :tenantId', { tenantId });

    if (query.search) {
      qb.andWhere(
        '(framework.name ILIKE :search OR framework.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      qb.andWhere('framework.status = :status', { status: query.status });
    }

    qb.orderBy('framework.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<ComplianceFramework> {
    const framework = await this.frameworkRepository.findOne({
      where: { id, tenantId },
      relations: ['scans'],
    });

    if (!framework) {
      throw new NotFoundException(`Framework with ID "${id}" not found`);
    }

    return framework;
  }

  async update(
    tenantId: string,
    id: string,
    dto: Partial<CreateFrameworkDto>,
  ): Promise<ComplianceFramework> {
    const framework = await this.findById(tenantId, id);

    if (dto.name && dto.name !== framework.name) {
      const existing = await this.frameworkRepository.findOne({
        where: { tenantId, name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Framework "${dto.name}" already exists for this tenant`);
      }
    }

    Object.assign(framework, dto);

    const saved = await this.frameworkRepository.save(framework);

    await this.kafkaService.emit('compliance-ai.framework.updated', {
      key: saved.id,
      value: {
        frameworkId: saved.id,
        tenantId,
        name: saved.name,
        status: saved.status,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Updated framework "${saved.name}" (${saved.id}) for tenant ${tenantId}`);
    return saved;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const framework = await this.findById(tenantId, id);
    await this.frameworkRepository.remove(framework);

    await this.kafkaService.emit('compliance-ai.framework.deleted', {
      key: id,
      value: {
        frameworkId: id,
        tenantId,
        name: framework.name,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Deleted framework "${framework.name}" (${id}) for tenant ${tenantId}`);
  }
}
