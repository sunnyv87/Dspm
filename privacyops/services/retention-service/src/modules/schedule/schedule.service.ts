import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetentionSchedule } from '../../entities/retention-schedule.entity';
import { RetentionPolicy } from '../../entities/retention-policy.entity';
import { KafkaService } from '../../common/kafka/kafka.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectRepository(RetentionSchedule)
    private readonly scheduleRepository: Repository<RetentionSchedule>,
    @InjectRepository(RetentionPolicy)
    private readonly policyRepository: Repository<RetentionPolicy>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateScheduleDto,
  ): Promise<RetentionSchedule> {
    const policy = await this.policyRepository.findOne({
      where: { id: dto.policyId, tenantId },
    });

    if (!policy) {
      throw new NotFoundException(`Retention policy with ID "${dto.policyId}" not found`);
    }

    const schedule = this.scheduleRepository.create({
      tenantId,
      policyId: dto.policyId,
      name: dto.name,
      cronExpression: dto.cronExpression,
      status: dto.status,
    });

    const saved = await this.scheduleRepository.save(schedule);
    this.logger.log(`Created retention schedule "${saved.name}" (${saved.id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('retention.schedule.created', {
      key: saved.id,
      value: { tenantId, scheduleId: saved.id, policyId: saved.policyId },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryScheduleDto,
  ): Promise<{ data: RetentionSchedule[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.policy', 'policy')
      .where('schedule.tenantId = :tenantId', { tenantId });

    if (query.policyId) {
      qb.andWhere('schedule.policyId = :policyId', { policyId: query.policyId });
    }

    if (query.status) {
      qb.andWhere('schedule.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere('schedule.name ILIKE :search', { search: `%${query.search.replace(/%/g, '\\%').replace(/_/g, '\\_')}%` });
    }

    qb.orderBy('schedule.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<RetentionSchedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id, tenantId },
      relations: ['policy', 'executions'],
    });

    if (!schedule) {
      throw new NotFoundException(`Retention schedule with ID "${id}" not found`);
    }

    return schedule;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: string,
  ): Promise<RetentionSchedule> {
    const schedule = await this.findById(tenantId, id);

    schedule.status = status as RetentionSchedule['status'];

    const saved = await this.scheduleRepository.save(schedule);
    this.logger.log(`Updated retention schedule "${saved.name}" (${saved.id}) status to ${status}`);

    await this.kafkaService.emit('retention.schedule.updated', {
      key: saved.id,
      value: { tenantId, scheduleId: saved.id, status },
    });

    return saved;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const schedule = await this.findById(tenantId, id);

    await this.scheduleRepository.remove(schedule);
    this.logger.log(`Deleted retention schedule "${schedule.name}" (${id}) for tenant ${tenantId}`);
  }
}
