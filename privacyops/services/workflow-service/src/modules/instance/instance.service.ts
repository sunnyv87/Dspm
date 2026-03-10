import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkflowInstance,
  InstanceStatus,
} from '../../entities/workflow-instance.entity';
import {
  WorkflowDefinition,
  DefinitionStatus,
} from '../../entities/workflow-definition.entity';
import { StartInstanceDto } from './dto/start-instance.dto';
import { QueryInstanceDto } from './dto/query-instance.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class InstanceService {
  private readonly logger = new Logger(InstanceService.name);

  constructor(
    @InjectRepository(WorkflowInstance)
    private readonly instanceRepository: Repository<WorkflowInstance>,
    @InjectRepository(WorkflowDefinition)
    private readonly definitionRepository: Repository<WorkflowDefinition>,
    private readonly kafkaService: KafkaService,
  ) {}

  async start(
    tenantId: string,
    initiatedBy: string,
    dto: StartInstanceDto,
  ): Promise<WorkflowInstance> {
    const definition = await this.definitionRepository.findOne({
      where: { id: dto.definitionId, tenantId },
    });

    if (!definition) {
      throw new NotFoundException(
        `Workflow definition with ID "${dto.definitionId}" not found`,
      );
    }

    if (definition.status !== DefinitionStatus.ACTIVE) {
      throw new BadRequestException(
        `Workflow definition "${definition.name}" is not active (status: ${definition.status})`,
      );
    }

    const firstStepId = definition.steps.length > 0 ? definition.steps[0].id : null;

    const dueDate = dto.dueDate
      ? new Date(dto.dueDate)
      : definition.slaHours
        ? new Date(Date.now() + definition.slaHours * 60 * 60 * 1000)
        : null;

    const instance = this.instanceRepository.create({
      tenantId,
      definitionId: definition.id,
      status: InstanceStatus.RUNNING,
      currentStepId: firstStepId,
      priority: dto.priority || undefined,
      startedAt: new Date(),
      dueDate,
      context: dto.context || {},
      initiatedBy,
      parentInstanceId: dto.parentInstanceId || null,
    });

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(
      `Started workflow instance "${saved.id}" for definition "${definition.name}" (tenant: ${tenantId})`,
    );

    await this.kafkaService.emit('workflow.instance.started', {
      key: saved.id,
      value: {
        eventType: 'workflow.instance.started',
        tenantId,
        instanceId: saved.id,
        definitionId: definition.id,
        definitionName: definition.name,
        priority: saved.priority,
        currentStepId: saved.currentStepId,
        initiatedBy,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryInstanceDto,
  ): Promise<{ data: WorkflowInstance[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.instanceRepository
      .createQueryBuilder('inst')
      .leftJoinAndSelect('inst.definition', 'def')
      .where('inst.tenantId = :tenantId', { tenantId });

    if (query.definitionId) {
      qb.andWhere('inst.definitionId = :definitionId', {
        definitionId: query.definitionId,
      });
    }

    if (query.status) {
      qb.andWhere('inst.status = :status', { status: query.status });
    }

    if (query.priority) {
      qb.andWhere('inst.priority = :priority', { priority: query.priority });
    }

    if (query.initiatedBy) {
      qb.andWhere('inst.initiatedBy = :initiatedBy', {
        initiatedBy: query.initiatedBy,
      });
    }

    if (query.parentInstanceId) {
      qb.andWhere('inst.parentInstanceId = :parentInstanceId', {
        parentInstanceId: query.parentInstanceId,
      });
    }

    qb.orderBy('inst.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<WorkflowInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id, tenantId },
      relations: ['definition', 'tasks', 'approvals'],
    });

    if (!instance) {
      throw new NotFoundException(`Workflow instance with ID "${id}" not found`);
    }

    return instance;
  }

  async cancel(tenantId: string, id: string, userId: string): Promise<WorkflowInstance> {
    const instance = await this.findById(tenantId, id);

    if (
      instance.status === InstanceStatus.COMPLETED ||
      instance.status === InstanceStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot cancel workflow instance with status "${instance.status}"`,
      );
    }

    instance.status = InstanceStatus.CANCELLED;
    instance.completedAt = new Date();

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(
      `Cancelled workflow instance "${saved.id}" for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('workflow.instance.cancelled', {
      key: saved.id,
      value: {
        eventType: 'workflow.instance.cancelled',
        tenantId,
        instanceId: saved.id,
        definitionId: saved.definitionId,
        cancelledBy: userId,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async pause(tenantId: string, id: string): Promise<WorkflowInstance> {
    const instance = await this.findById(tenantId, id);

    if (instance.status !== InstanceStatus.RUNNING) {
      throw new BadRequestException(
        `Cannot pause workflow instance with status "${instance.status}"`,
      );
    }

    instance.status = InstanceStatus.PAUSED;

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(
      `Paused workflow instance "${saved.id}" for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('workflow.instance.paused', {
      key: saved.id,
      value: {
        eventType: 'workflow.instance.paused',
        tenantId,
        instanceId: saved.id,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async resume(tenantId: string, id: string): Promise<WorkflowInstance> {
    const instance = await this.findById(tenantId, id);

    if (instance.status !== InstanceStatus.PAUSED) {
      throw new BadRequestException(
        `Cannot resume workflow instance with status "${instance.status}"`,
      );
    }

    instance.status = InstanceStatus.RUNNING;

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(
      `Resumed workflow instance "${saved.id}" for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('workflow.instance.resumed', {
      key: saved.id,
      value: {
        eventType: 'workflow.instance.resumed',
        tenantId,
        instanceId: saved.id,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }
}
