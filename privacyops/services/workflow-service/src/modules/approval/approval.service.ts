import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApprovalRecord,
  ApprovalDecision,
} from '../../entities/approval-record.entity';
import { WorkflowTask, TaskStatus } from '../../entities/workflow-task.entity';
import { WorkflowInstance } from '../../entities/workflow-instance.entity';
import { SubmitApprovalDto } from './dto/submit-approval.dto';
import { QueryApprovalDto } from './dto/query-approval.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(
    @InjectRepository(ApprovalRecord)
    private readonly approvalRepository: Repository<ApprovalRecord>,
    @InjectRepository(WorkflowTask)
    private readonly taskRepository: Repository<WorkflowTask>,
    @InjectRepository(WorkflowInstance)
    private readonly instanceRepository: Repository<WorkflowInstance>,
    private readonly kafkaService: KafkaService,
  ) {}

  async submit(
    tenantId: string,
    approverId: string,
    approverEmail: string,
    dto: SubmitApprovalDto,
  ): Promise<ApprovalRecord> {
    // Validate task exists and belongs to tenant
    const task = await this.taskRepository.findOne({
      where: { id: dto.taskId, tenantId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${dto.taskId}" not found`);
    }

    if (
      task.status === TaskStatus.COMPLETED ||
      task.status === TaskStatus.SKIPPED ||
      task.status === TaskStatus.FAILED
    ) {
      throw new BadRequestException(
        `Cannot submit approval for task with status "${task.status}"`,
      );
    }

    // Validate instance exists
    const instance = await this.instanceRepository.findOne({
      where: { id: dto.instanceId, tenantId },
    });

    if (!instance) {
      throw new NotFoundException(
        `Workflow instance with ID "${dto.instanceId}" not found`,
      );
    }

    const approval = this.approvalRepository.create({
      tenantId,
      taskId: dto.taskId,
      instanceId: dto.instanceId,
      approverId,
      approverEmail: dto.approverEmail || approverEmail,
      decision: dto.decision,
      comments: dto.comments || null,
      conditions: dto.conditions || null,
      decidedAt: new Date(),
    });

    const saved = await this.approvalRepository.save(approval);
    this.logger.log(
      `Approval submitted for task "${dto.taskId}" by ${approverId}: ${dto.decision} (tenant: ${tenantId})`,
    );

    // Update task status based on approval decision
    if (dto.decision === ApprovalDecision.APPROVED) {
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
      task.completedBy = approverId;
      await this.taskRepository.save(task);
    } else if (dto.decision === ApprovalDecision.REJECTED) {
      task.status = TaskStatus.FAILED;
      task.completedAt = new Date();
      task.completedBy = approverId;
      await this.taskRepository.save(task);
    }
    // DEFERRED leaves task in current status

    await this.kafkaService.emit('workflow.approval.submitted', {
      key: saved.id,
      value: {
        eventType: 'workflow.approval.submitted',
        tenantId,
        approvalId: saved.id,
        taskId: dto.taskId,
        instanceId: dto.instanceId,
        approverId,
        decision: dto.decision,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryApprovalDto,
  ): Promise<{ data: ApprovalRecord[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.approvalRepository
      .createQueryBuilder('approval')
      .leftJoinAndSelect('approval.task', 'task')
      .leftJoinAndSelect('approval.instance', 'inst')
      .where('approval.tenantId = :tenantId', { tenantId });

    if (query.taskId) {
      qb.andWhere('approval.taskId = :taskId', { taskId: query.taskId });
    }

    if (query.instanceId) {
      qb.andWhere('approval.instanceId = :instanceId', {
        instanceId: query.instanceId,
      });
    }

    if (query.approverId) {
      qb.andWhere('approval.approverId = :approverId', {
        approverId: query.approverId,
      });
    }

    if (query.decision) {
      qb.andWhere('approval.decision = :decision', {
        decision: query.decision,
      });
    }

    qb.orderBy('approval.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<ApprovalRecord> {
    const approval = await this.approvalRepository.findOne({
      where: { id, tenantId },
      relations: ['task', 'instance'],
    });

    if (!approval) {
      throw new NotFoundException(`Approval record with ID "${id}" not found`);
    }

    return approval;
  }

  async getMyApprovals(
    tenantId: string,
    approverId: string,
    query: QueryApprovalDto,
  ): Promise<{ data: ApprovalRecord[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.approvalRepository
      .createQueryBuilder('approval')
      .leftJoinAndSelect('approval.task', 'task')
      .leftJoinAndSelect('approval.instance', 'inst')
      .where('approval.tenantId = :tenantId', { tenantId })
      .andWhere('approval.approverId = :approverId', { approverId });

    if (query.decision) {
      qb.andWhere('approval.decision = :decision', {
        decision: query.decision,
      });
    }

    if (query.instanceId) {
      qb.andWhere('approval.instanceId = :instanceId', {
        instanceId: query.instanceId,
      });
    }

    qb.orderBy('approval.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async getPendingApprovals(
    tenantId: string,
    approverId: string,
    query: QueryApprovalDto,
  ): Promise<{ data: WorkflowTask[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.instance', 'inst')
      .where('task.tenantId = :tenantId', { tenantId })
      .andWhere('task.type = :type', { type: 'APPROVAL' })
      .andWhere('task.assignedTo = :approverId', { approverId })
      .andWhere('task.status IN (:...statuses)', {
        statuses: [TaskStatus.PENDING, TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS],
      });

    qb.orderBy('task.createdAt', 'ASC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }
}
