import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetentionExecution, ExecutionStatus } from '../../entities/retention-execution.entity';
import { RetentionPolicy } from '../../entities/retention-policy.entity';
import { KafkaService } from '../../common/kafka/kafka.service';
import { TriggerExecutionDto } from './dto/trigger-execution.dto';
import { QueryExecutionDto } from './dto/query-execution.dto';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    @InjectRepository(RetentionExecution)
    private readonly executionRepository: Repository<RetentionExecution>,
    @InjectRepository(RetentionPolicy)
    private readonly policyRepository: Repository<RetentionPolicy>,
    private readonly kafkaService: KafkaService,
  ) {}

  async trigger(
    tenantId: string,
    dto: TriggerExecutionDto,
  ): Promise<RetentionExecution> {
    const policy = await this.policyRepository.findOne({
      where: { id: dto.policyId, tenantId },
    });

    if (!policy) {
      throw new NotFoundException(`Retention policy with ID "${dto.policyId}" not found`);
    }

    const execution = this.executionRepository.create({
      tenantId,
      policyId: dto.policyId,
      scheduleId: dto.scheduleId || null,
      status: ExecutionStatus.PENDING,
    });

    const saved = await this.executionRepository.save(execution);
    this.logger.log(`Triggered retention execution (${saved.id}) for policy ${dto.policyId}`);

    await this.kafkaService.emit('retention.execution.triggered', {
      key: saved.id,
      value: {
        tenantId,
        executionId: saved.id,
        policyId: dto.policyId,
        action: policy.action,
      },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryExecutionDto,
  ): Promise<{ data: RetentionExecution[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.executionRepository
      .createQueryBuilder('execution')
      .leftJoinAndSelect('execution.policy', 'policy')
      .leftJoinAndSelect('execution.schedule', 'schedule')
      .where('execution.tenantId = :tenantId', { tenantId });

    if (query.policyId) {
      qb.andWhere('execution.policyId = :policyId', { policyId: query.policyId });
    }

    if (query.scheduleId) {
      qb.andWhere('execution.scheduleId = :scheduleId', { scheduleId: query.scheduleId });
    }

    if (query.status) {
      qb.andWhere('execution.status = :status', { status: query.status });
    }

    qb.orderBy('execution.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<RetentionExecution> {
    const execution = await this.executionRepository.findOne({
      where: { id, tenantId },
      relations: ['policy', 'schedule'],
    });

    if (!execution) {
      throw new NotFoundException(`Retention execution with ID "${id}" not found`);
    }

    return execution;
  }
}
