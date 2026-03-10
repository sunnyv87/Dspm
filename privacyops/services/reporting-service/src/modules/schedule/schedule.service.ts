import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduledReport } from '../../entities/scheduled-report.entity';
import { ReportDefinition } from '../../entities/report-definition.entity';
import { KafkaService } from '../../common/kafka/kafka.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectRepository(ScheduledReport)
    private readonly scheduleRepository: Repository<ScheduledReport>,
    @InjectRepository(ReportDefinition)
    private readonly definitionRepository: Repository<ReportDefinition>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    createdBy: string,
    dto: CreateScheduleDto,
  ): Promise<ScheduledReport> {
    const definition = await this.definitionRepository.findOne({
      where: { id: dto.definitionId, tenantId },
    });

    if (!definition) {
      throw new NotFoundException(`Report definition with ID "${dto.definitionId}" not found`);
    }

    const schedule = this.scheduleRepository.create({
      tenantId,
      createdBy,
      definitionId: dto.definitionId,
      name: dto.name,
      cronExpression: dto.cronExpression,
      recipients: dto.recipients || [],
      status: dto.status,
    });

    const saved = await this.scheduleRepository.save(schedule);
    this.logger.log(`Created scheduled report "${saved.name}" (${saved.id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('reporting.schedule.created', {
      key: saved.id,
      value: { tenantId, scheduleId: saved.id, definitionId: saved.definitionId },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryScheduleDto,
  ): Promise<{ data: ScheduledReport[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.definition', 'definition')
      .where('schedule.tenantId = :tenantId', { tenantId });

    if (query.definitionId) {
      qb.andWhere('schedule.definitionId = :definitionId', { definitionId: query.definitionId });
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

  async findById(tenantId: string, id: string): Promise<ScheduledReport> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id, tenantId },
      relations: ['definition'],
    });

    if (!schedule) {
      throw new NotFoundException(`Scheduled report with ID "${id}" not found`);
    }

    return schedule;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const schedule = await this.findById(tenantId, id);

    await this.scheduleRepository.remove(schedule);
    this.logger.log(`Deleted scheduled report "${schedule.name}" (${id}) for tenant ${tenantId}`);
  }
}
