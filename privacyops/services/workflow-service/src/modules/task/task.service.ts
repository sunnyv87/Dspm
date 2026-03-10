import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowTask, TaskStatus } from '../../entities/workflow-task.entity';
import {
  WorkflowInstance,
  InstanceStatus,
} from '../../entities/workflow-instance.entity';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(WorkflowTask)
    private readonly taskRepository: Repository<WorkflowTask>,
    @InjectRepository(WorkflowInstance)
    private readonly instanceRepository: Repository<WorkflowInstance>,
    private readonly kafkaService: KafkaService,
  ) {}

  async findAll(
    tenantId: string,
    query: QueryTaskDto,
  ): Promise<{ data: WorkflowTask[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.instance', 'inst')
      .where('task.tenantId = :tenantId', { tenantId });

    if (query.instanceId) {
      qb.andWhere('task.instanceId = :instanceId', {
        instanceId: query.instanceId,
      });
    }

    if (query.type) {
      qb.andWhere('task.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('task.status = :status', { status: query.status });
    }

    if (query.assignedTo) {
      qb.andWhere('task.assignedTo = :assignedTo', {
        assignedTo: query.assignedTo,
      });
    }

    if (query.assignedGroup) {
      qb.andWhere('task.assignedGroup = :assignedGroup', {
        assignedGroup: query.assignedGroup,
      });
    }

    qb.orderBy('task.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<WorkflowTask> {
    const task = await this.taskRepository.findOne({
      where: { id, tenantId },
      relations: ['instance', 'approvals'],
    });

    if (!task) {
      throw new NotFoundException(`Workflow task with ID "${id}" not found`);
    }

    return task;
  }

  async assign(
    tenantId: string,
    id: string,
    dto: AssignTaskDto,
  ): Promise<WorkflowTask> {
    const task = await this.findById(tenantId, id);

    if (
      task.status === TaskStatus.COMPLETED ||
      task.status === TaskStatus.SKIPPED ||
      task.status === TaskStatus.FAILED
    ) {
      throw new BadRequestException(
        `Cannot assign task with status "${task.status}"`,
      );
    }

    if (dto.assignedTo) {
      task.assignedTo = dto.assignedTo;
    }
    if (dto.assignedGroup) {
      task.assignedGroup = dto.assignedGroup;
    }
    task.status = TaskStatus.ASSIGNED;

    const saved = await this.taskRepository.save(task);
    this.logger.log(
      `Assigned task "${saved.id}" to user=${dto.assignedTo || 'n/a'} group=${dto.assignedGroup || 'n/a'} for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('workflow.task.assigned', {
      key: saved.id,
      value: {
        eventType: 'workflow.task.assigned',
        tenantId,
        taskId: saved.id,
        instanceId: saved.instanceId,
        assignedTo: saved.assignedTo,
        assignedGroup: saved.assignedGroup,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async complete(
    tenantId: string,
    id: string,
    userId: string,
    dto: CompleteTaskDto,
  ): Promise<WorkflowTask> {
    const task = await this.findById(tenantId, id);

    if (
      task.status === TaskStatus.COMPLETED ||
      task.status === TaskStatus.SKIPPED ||
      task.status === TaskStatus.FAILED
    ) {
      throw new BadRequestException(
        `Cannot complete task with status "${task.status}"`,
      );
    }

    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.completedBy = userId;
    if (dto.output) {
      task.output = dto.output;
    }

    const saved = await this.taskRepository.save(task);
    this.logger.log(
      `Completed task "${saved.id}" by user ${userId} for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('workflow.task.completed', {
      key: saved.id,
      value: {
        eventType: 'workflow.task.completed',
        tenantId,
        taskId: saved.id,
        instanceId: saved.instanceId,
        stepId: saved.stepId,
        completedBy: userId,
        output: saved.output,
        timestamp: new Date().toISOString(),
      },
    });

    // Check if all tasks in the instance are completed
    await this.checkInstanceCompletion(tenantId, saved.instanceId);

    return saved;
  }

  async skip(
    tenantId: string,
    id: string,
    userId: string,
  ): Promise<WorkflowTask> {
    const task = await this.findById(tenantId, id);

    if (
      task.status === TaskStatus.COMPLETED ||
      task.status === TaskStatus.SKIPPED ||
      task.status === TaskStatus.FAILED
    ) {
      throw new BadRequestException(
        `Cannot skip task with status "${task.status}"`,
      );
    }

    task.status = TaskStatus.SKIPPED;
    task.completedAt = new Date();
    task.completedBy = userId;

    const saved = await this.taskRepository.save(task);
    this.logger.log(
      `Skipped task "${saved.id}" by user ${userId} for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('workflow.task.skipped', {
      key: saved.id,
      value: {
        eventType: 'workflow.task.skipped',
        tenantId,
        taskId: saved.id,
        instanceId: saved.instanceId,
        skippedBy: userId,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async getMyTasks(
    tenantId: string,
    userId: string,
    query: QueryTaskDto,
  ): Promise<{ data: WorkflowTask[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.instance', 'inst')
      .where('task.tenantId = :tenantId', { tenantId })
      .andWhere('task.assignedTo = :userId', { userId });

    if (query.status) {
      qb.andWhere('task.status = :status', { status: query.status });
    }

    if (query.type) {
      qb.andWhere('task.type = :type', { type: query.type });
    }

    qb.orderBy('task.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  private async checkInstanceCompletion(
    tenantId: string,
    instanceId: string,
  ): Promise<void> {
    const pendingTasks = await this.taskRepository.count({
      where: {
        tenantId,
        instanceId,
        status: TaskStatus.PENDING,
      },
    });

    const assignedTasks = await this.taskRepository.count({
      where: {
        tenantId,
        instanceId,
        status: TaskStatus.ASSIGNED,
      },
    });

    const inProgressTasks = await this.taskRepository.count({
      where: {
        tenantId,
        instanceId,
        status: TaskStatus.IN_PROGRESS,
      },
    });

    if (pendingTasks === 0 && assignedTasks === 0 && inProgressTasks === 0) {
      const instance = await this.instanceRepository.findOne({
        where: { id: instanceId, tenantId },
      });

      if (instance && instance.status === InstanceStatus.RUNNING) {
        instance.status = InstanceStatus.COMPLETED;
        instance.completedAt = new Date();
        await this.instanceRepository.save(instance);

        this.logger.log(
          `All tasks completed. Workflow instance "${instanceId}" marked as completed.`,
        );

        await this.kafkaService.emit('workflow.instance.completed', {
          key: instance.id,
          value: {
            eventType: 'workflow.instance.completed',
            tenantId,
            instanceId: instance.id,
            definitionId: instance.definitionId,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  }
}
