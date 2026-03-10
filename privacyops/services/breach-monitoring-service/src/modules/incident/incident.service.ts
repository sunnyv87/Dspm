import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BreachIncident, BreachStatus } from '../../entities/breach-incident.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { QueryIncidentDto } from './dto/query-incident.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class IncidentService {
  private readonly logger = new Logger(IncidentService.name);

  constructor(
    @InjectRepository(BreachIncident)
    private readonly incidentRepository: Repository<BreachIncident>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    dto: CreateIncidentDto,
  ): Promise<BreachIncident> {
    const incident = this.incidentRepository.create({
      tenantId,
      title: dto.title,
      description: dto.description,
      severity: dto.severity,
      status: BreachStatus.DETECTED,
      type: dto.type,
      detectedAt: dto.detectedAt ? new Date(dto.detectedAt) : new Date(),
      reportedAt: dto.reportedAt ? new Date(dto.reportedAt) : null,
      affectedDataTypes: dto.affectedDataTypes || [],
      affectedSystems: dto.affectedSystems || [],
      estimatedAffectedCount: dto.estimatedAffectedCount || null,
      rootCause: dto.rootCause || null,
      impactAssessment: dto.impactAssessment || null,
      leadInvestigatorId: dto.leadInvestigatorId || null,
      assignedTeam: dto.assignedTeam || [],
      regulatoryReportRequired: dto.regulatoryReportRequired || false,
      regulatoryReportDeadline: dto.regulatoryReportDeadline
        ? new Date(dto.regulatoryReportDeadline)
        : null,
      metadata: dto.metadata || null,
    });

    // If regulatory report is required but no deadline set, calculate GDPR 72-hour deadline
    if (incident.regulatoryReportRequired && !incident.regulatoryReportDeadline) {
      const detectedDate = incident.detectedAt || new Date();
      incident.regulatoryReportDeadline = new Date(
        detectedDate.getTime() + 72 * 60 * 60 * 1000,
      );
    }

    const saved = await this.incidentRepository.save(incident);

    this.logger.log(
      `Created breach incident "${saved.title}" (${saved.id}) for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('breach.incident.created', {
      key: saved.id,
      value: {
        eventType: 'breach.incident.created',
        tenantId,
        userId,
        incidentId: saved.id,
        severity: saved.severity,
        type: saved.type,
        regulatoryReportRequired: saved.regulatoryReportRequired,
        regulatoryReportDeadline: saved.regulatoryReportDeadline,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryIncidentDto,
  ): Promise<{ data: BreachIncident[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.incidentRepository
      .createQueryBuilder('incident')
      .where('incident.tenantId = :tenantId', { tenantId });

    if (query.search) {
      qb.andWhere(
        '(incident.title ILIKE :search OR incident.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.severity) {
      qb.andWhere('incident.severity = :severity', { severity: query.severity });
    }

    if (query.status) {
      qb.andWhere('incident.status = :status', { status: query.status });
    }

    if (query.type) {
      qb.andWhere('incident.type = :type', { type: query.type });
    }

    qb.orderBy('incident.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<BreachIncident> {
    const incident = await this.incidentRepository.findOne({
      where: { id, tenantId },
      relations: ['notifications', 'timelineEntries', 'affectedSubjects'],
    });

    if (!incident) {
      throw new NotFoundException(`Breach incident with ID "${id}" not found`);
    }

    return incident;
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdateIncidentDto,
  ): Promise<BreachIncident> {
    const incident = await this.findById(tenantId, id);

    const previousStatus = incident.status;

    Object.assign(incident, {
      ...dto,
      detectedAt: dto.detectedAt ? new Date(dto.detectedAt) : incident.detectedAt,
      reportedAt: dto.reportedAt ? new Date(dto.reportedAt) : incident.reportedAt,
      containedAt: dto.containedAt ? new Date(dto.containedAt) : incident.containedAt,
      resolvedAt: dto.resolvedAt ? new Date(dto.resolvedAt) : incident.resolvedAt,
      regulatoryReportDeadline: dto.regulatoryReportDeadline
        ? new Date(dto.regulatoryReportDeadline)
        : incident.regulatoryReportDeadline,
    });

    // Auto-set containedAt when status changes to CONTAINED
    if (dto.status === BreachStatus.CONTAINED && !incident.containedAt) {
      incident.containedAt = new Date();
    }

    // Auto-set resolvedAt when status changes to CLOSED
    if (dto.status === BreachStatus.CLOSED && !incident.resolvedAt) {
      incident.resolvedAt = new Date();
    }

    const saved = await this.incidentRepository.save(incident);

    this.logger.log(
      `Updated breach incident "${saved.title}" (${saved.id}) for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('breach.incident.updated', {
      key: saved.id,
      value: {
        eventType: 'breach.incident.updated',
        tenantId,
        userId,
        incidentId: saved.id,
        previousStatus,
        currentStatus: saved.status,
        severity: saved.severity,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const incident = await this.findById(tenantId, id);
    await this.incidentRepository.remove(incident);

    this.logger.log(
      `Deleted breach incident "${incident.title}" (${id}) for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('breach.incident.deleted', {
      key: id,
      value: {
        eventType: 'breach.incident.deleted',
        tenantId,
        userId,
        incidentId: id,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
