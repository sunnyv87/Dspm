import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportExecution } from '../../entities/report-execution.entity';
import { QueryExecutionDto } from './dto/query-execution.dto';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    @InjectRepository(ReportExecution)
    private readonly executionRepository: Repository<ReportExecution>,
  ) {}

  async findAll(
    tenantId: string,
    query: QueryExecutionDto,
  ): Promise<{ data: ReportExecution[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.executionRepository
      .createQueryBuilder('execution')
      .leftJoinAndSelect('execution.definition', 'definition')
      .where('execution.tenantId = :tenantId', { tenantId });

    if (query.definitionId) {
      qb.andWhere('execution.definitionId = :definitionId', { definitionId: query.definitionId });
    }

    if (query.status) {
      qb.andWhere('execution.status = :status', { status: query.status });
    }

    qb.orderBy('execution.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<ReportExecution> {
    const execution = await this.executionRepository.findOne({
      where: { id, tenantId },
      relations: ['definition'],
    });

    if (!execution) {
      throw new NotFoundException(`Report execution with ID "${id}" not found`);
    }

    return execution;
  }
}
