import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RightsTask, TaskStatus } from '../../entities/rights-task.entity';
import { KafkaService } from '../../common/kafka/kafka.service';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(RightsTask)
    private readonly taskRepository: Repository<RightsTask>,
    private readonly kafkaService: KafkaService,
  ) {}

  async findAll(
    tenantId: string,
    query: QueryTaskDto,
  ): Promise<{ data: RightsTask[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.request', 'request')
      .where('task.tenantId = :tenantId', { tenantId });

    if (query.requestId) {
      qb.andWhere('task.requestId = :requestId', { requestId: query.requestId });
    }

    if (query.type) {
      qb.andWhere('task.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('task.status = :status', { status: query.status });
    }

    if (query.assignedTo) {
      qb.andWhere('task.assignedTo = :assignedTo', { assignedTo: query.assignedTo });
    }

    qb.orderBy('task.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<RightsTask> {
    const task = await this.taskRepository.findOne({
      where: { id, tenantId },
      relations: ['request'],
    });

    if (!task) {
      throw new NotFoundException(`Rights task with ID "${id}" not found`);
    }

    return task;
  }

  async complete(
    tenantId: string,
    id: string,
    userId: string,
    dto: CompleteTaskDto,
  ): Promise<RightsTask> {
    const task = await this.findById(tenantId, id);

    task.status = dto.status || TaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.completedBy = userId;
    task.output = dto.output || null;

    const saved = await this.taskRepository.save(task);
    this.logger.log(`Completed task "${saved.name}" (${saved.id}) with status ${saved.status}`);

    await this.kafkaService.emit('rights.task.completed', {
      key: saved.id,
      value: {
        tenantId,
        taskId: saved.id,
        requestId: saved.requestId,
        status: saved.status,
      },
    });

    return saved;
  }
}
