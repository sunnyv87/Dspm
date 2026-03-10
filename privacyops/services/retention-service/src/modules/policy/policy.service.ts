import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetentionPolicy } from '../../entities/retention-policy.entity';
import { KafkaService } from '../../common/kafka/kafka.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { QueryPolicyDto } from './dto/query-policy.dto';

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);

  constructor(
    @InjectRepository(RetentionPolicy)
    private readonly policyRepository: Repository<RetentionPolicy>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    createdBy: string,
    dto: CreatePolicyDto,
  ): Promise<RetentionPolicy> {
    const policy = this.policyRepository.create({
      tenantId,
      createdBy,
      ...dto,
    });

    const saved = await this.policyRepository.save(policy);
    this.logger.log(`Created retention policy "${saved.name}" (${saved.id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('retention.policy.created', {
      key: saved.id,
      value: { tenantId, policyId: saved.id, name: saved.name, action: saved.action },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryPolicyDto,
  ): Promise<{ data: RetentionPolicy[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.policyRepository
      .createQueryBuilder('policy')
      .where('policy.tenantId = :tenantId', { tenantId });

    if (query.search) {
      qb.andWhere('(policy.name ILIKE :search OR policy.description ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.status) {
      qb.andWhere('policy.status = :status', { status: query.status });
    }

    if (query.action) {
      qb.andWhere('policy.action = :action', { action: query.action });
    }

    if (query.dataCategory) {
      qb.andWhere('policy.dataCategory = :dataCategory', { dataCategory: query.dataCategory });
    }

    qb.orderBy('policy.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<RetentionPolicy> {
    const policy = await this.policyRepository.findOne({
      where: { id, tenantId },
      relations: ['schedules', 'executions'],
    });

    if (!policy) {
      throw new NotFoundException(`Retention policy with ID "${id}" not found`);
    }

    return policy;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdatePolicyDto,
  ): Promise<RetentionPolicy> {
    const policy = await this.findById(tenantId, id);

    Object.assign(policy, dto);

    const saved = await this.policyRepository.save(policy);
    this.logger.log(`Updated retention policy "${saved.name}" (${saved.id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('retention.policy.updated', {
      key: saved.id,
      value: { tenantId, policyId: saved.id, name: saved.name },
    });

    return saved;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const policy = await this.findById(tenantId, id);

    await this.policyRepository.remove(policy);
    this.logger.log(`Deleted retention policy "${policy.name}" (${id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('retention.policy.deleted', {
      key: id,
      value: { tenantId, policyId: id },
    });
  }
}
