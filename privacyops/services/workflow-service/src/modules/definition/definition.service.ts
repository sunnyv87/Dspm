import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkflowDefinition,
  DefinitionStatus,
} from '../../entities/workflow-definition.entity';
import { CreateDefinitionDto } from './dto/create-definition.dto';
import { UpdateDefinitionDto } from './dto/update-definition.dto';
import { QueryDefinitionDto } from './dto/query-definition.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class DefinitionService {
  private readonly logger = new Logger(DefinitionService.name);

  constructor(
    @InjectRepository(WorkflowDefinition)
    private readonly definitionRepository: Repository<WorkflowDefinition>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    createdBy: string,
    dto: CreateDefinitionDto,
  ): Promise<WorkflowDefinition> {
    const existing = await this.definitionRepository.findOne({
      where: { tenantId, name: dto.name, version: 1 },
    });

    if (existing) {
      throw new ConflictException(
        `Workflow definition "${dto.name}" already exists for this tenant`,
      );
    }

    const definition = this.definitionRepository.create({
      tenantId,
      createdBy,
      name: dto.name,
      description: dto.description || null,
      category: dto.category,
      status: DefinitionStatus.DRAFT,
      steps: dto.steps || [],
      triggers: dto.triggers || [],
      slaHours: dto.slaHours || null,
      version: 1,
    });

    const saved = await this.definitionRepository.save(definition);
    this.logger.log(
      `Created workflow definition "${saved.name}" (${saved.id}) for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('workflow.definition.created', {
      key: saved.id,
      value: {
        eventType: 'workflow.definition.created',
        tenantId,
        definitionId: saved.id,
        name: saved.name,
        category: saved.category,
        createdBy,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryDefinitionDto,
  ): Promise<{ data: WorkflowDefinition[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.definitionRepository
      .createQueryBuilder('def')
      .where('def.tenantId = :tenantId', { tenantId });

    if (query.search) {
      qb.andWhere(
        '(def.name ILIKE :search OR def.description ILIKE :search)',
        { search: `%${query.search.replace(/%/g, '\\%').replace(/_/g, '\\_')}%` },
      );
    }

    if (query.category) {
      qb.andWhere('def.category = :category', { category: query.category });
    }

    if (query.status) {
      qb.andWhere('def.status = :status', { status: query.status });
    }

    qb.orderBy('def.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<WorkflowDefinition> {
    const definition = await this.definitionRepository.findOne({
      where: { id, tenantId },
      relations: ['instances'],
    });

    if (!definition) {
      throw new NotFoundException(`Workflow definition with ID "${id}" not found`);
    }

    return definition;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateDefinitionDto,
  ): Promise<WorkflowDefinition> {
    const definition = await this.findById(tenantId, id);

    Object.assign(definition, dto);

    const saved = await this.definitionRepository.save(definition);
    this.logger.log(
      `Updated workflow definition "${saved.name}" (${saved.id}) for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('workflow.definition.updated', {
      key: saved.id,
      value: {
        eventType: 'workflow.definition.updated',
        tenantId,
        definitionId: saved.id,
        name: saved.name,
        status: saved.status,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const definition = await this.findById(tenantId, id);

    definition.status = DefinitionStatus.ARCHIVED;
    await this.definitionRepository.save(definition);

    this.logger.log(
      `Archived workflow definition "${definition.name}" (${definition.id}) for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('workflow.definition.archived', {
      key: definition.id,
      value: {
        eventType: 'workflow.definition.archived',
        tenantId,
        definitionId: definition.id,
        name: definition.name,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async createNewVersion(
    tenantId: string,
    id: string,
    createdBy: string,
    dto: CreateDefinitionDto,
  ): Promise<WorkflowDefinition> {
    const previous = await this.findById(tenantId, id);

    // Deprecate previous version
    previous.status = DefinitionStatus.DEPRECATED;
    await this.definitionRepository.save(previous);

    const newDefinition = this.definitionRepository.create({
      tenantId,
      createdBy,
      name: dto.name || previous.name,
      description: dto.description ?? previous.description,
      category: dto.category || previous.category,
      status: DefinitionStatus.DRAFT,
      steps: dto.steps || previous.steps,
      triggers: dto.triggers || previous.triggers,
      slaHours: dto.slaHours ?? previous.slaHours,
      version: previous.version + 1,
    });

    const saved = await this.definitionRepository.save(newDefinition);
    this.logger.log(
      `Created new version (v${saved.version}) of workflow definition "${saved.name}" (${saved.id}) for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('workflow.definition.versioned', {
      key: saved.id,
      value: {
        eventType: 'workflow.definition.versioned',
        tenantId,
        definitionId: saved.id,
        previousDefinitionId: previous.id,
        version: saved.version,
        name: saved.name,
        createdBy,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }
}
