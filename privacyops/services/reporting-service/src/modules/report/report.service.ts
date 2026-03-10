import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportDefinition } from '../../entities/report-definition.entity';
import { ReportExecution, ReportExecutionStatus } from '../../entities/report-execution.entity';
import { KafkaService } from '../../common/kafka/kafka.service';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { GenerateReportDto } from './dto/generate-report.dto';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectRepository(ReportDefinition)
    private readonly reportRepository: Repository<ReportDefinition>,
    @InjectRepository(ReportExecution)
    private readonly executionRepository: Repository<ReportExecution>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    createdBy: string,
    dto: CreateReportDto,
  ): Promise<ReportDefinition> {
    const report = this.reportRepository.create({
      tenantId,
      createdBy,
      ...dto,
    });

    const saved = await this.reportRepository.save(report);
    this.logger.log(`Created report definition "${saved.name}" (${saved.id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('reporting.definition.created', {
      key: saved.id,
      value: { tenantId, definitionId: saved.id, name: saved.name, type: saved.type },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryReportDto,
  ): Promise<{ data: ReportDefinition[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.reportRepository
      .createQueryBuilder('report')
      .where('report.tenantId = :tenantId', { tenantId });

    if (query.search) {
      qb.andWhere('(report.name ILIKE :search OR report.description ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.type) {
      qb.andWhere('report.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('report.status = :status', { status: query.status });
    }

    qb.orderBy('report.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<ReportDefinition> {
    const report = await this.reportRepository.findOne({
      where: { id, tenantId },
      relations: ['executions', 'scheduledReports'],
    });

    if (!report) {
      throw new NotFoundException(`Report definition with ID "${id}" not found`);
    }

    return report;
  }

  async generate(
    tenantId: string,
    id: string,
    userId: string,
    dto: GenerateReportDto,
  ): Promise<ReportExecution> {
    const report = await this.findById(tenantId, id);

    const execution = this.executionRepository.create({
      tenantId,
      definitionId: id,
      status: ReportExecutionStatus.PENDING,
      format: dto.format || report.format,
      generatedBy: userId,
      parameters: dto.parameters || null,
    });

    const saved = await this.executionRepository.save(execution);
    this.logger.log(`Triggered report generation (${saved.id}) for definition ${id}`);

    await this.kafkaService.emit('reporting.execution.triggered', {
      key: saved.id,
      value: {
        tenantId,
        executionId: saved.id,
        definitionId: id,
        format: saved.format,
      },
    });

    return saved;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const report = await this.findById(tenantId, id);

    await this.reportRepository.remove(report);
    this.logger.log(`Deleted report definition "${report.name}" (${id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('reporting.definition.deleted', {
      key: id,
      value: { tenantId, definitionId: id },
    });
  }
}
