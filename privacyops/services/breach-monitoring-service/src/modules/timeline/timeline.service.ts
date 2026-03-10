import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BreachTimeline } from '../../entities/breach-timeline.entity';
import { BreachIncident } from '../../entities/breach-incident.entity';
import { AddTimelineEntryDto } from './dto/add-timeline-entry.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class TimelineService {
  private readonly logger = new Logger(TimelineService.name);

  constructor(
    @InjectRepository(BreachTimeline)
    private readonly timelineRepository: Repository<BreachTimeline>,
    @InjectRepository(BreachIncident)
    private readonly incidentRepository: Repository<BreachIncident>,
    private readonly kafkaService: KafkaService,
  ) {}

  async addEntry(
    tenantId: string,
    userId: string,
    dto: AddTimelineEntryDto,
  ): Promise<BreachTimeline> {
    // Verify incident exists and belongs to tenant
    const incident = await this.incidentRepository.findOne({
      where: { id: dto.incidentId, tenantId },
    });

    if (!incident) {
      throw new NotFoundException(
        `Breach incident with ID "${dto.incidentId}" not found`,
      );
    }

    const entry = this.timelineRepository.create({
      tenantId,
      incidentId: dto.incidentId,
      eventType: dto.eventType,
      description: dto.description,
      performedBy: dto.performedBy || userId,
      attachments: dto.attachments || null,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
    });

    const saved = await this.timelineRepository.save(entry);

    this.logger.log(
      `Added timeline entry (${saved.id}) for incident ${dto.incidentId} tenant ${tenantId}`,
    );

    await this.kafkaService.emit('breach.timeline.entry_added', {
      key: saved.id,
      value: {
        eventType: 'breach.timeline.entry_added',
        tenantId,
        userId,
        timelineEntryId: saved.id,
        incidentId: dto.incidentId,
        timelineEventType: saved.eventType,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async findByIncident(
    tenantId: string,
    incidentId: string,
  ): Promise<BreachTimeline[]> {
    // Verify incident exists and belongs to tenant
    const incident = await this.incidentRepository.findOne({
      where: { id: incidentId, tenantId },
    });

    if (!incident) {
      throw new NotFoundException(
        `Breach incident with ID "${incidentId}" not found`,
      );
    }

    return this.timelineRepository.find({
      where: { tenantId, incidentId },
      order: { occurredAt: 'ASC' },
    });
  }

  async findById(tenantId: string, id: string): Promise<BreachTimeline> {
    const entry = await this.timelineRepository.findOne({
      where: { id, tenantId },
      relations: ['incident'],
    });

    if (!entry) {
      throw new NotFoundException(`Timeline entry with ID "${id}" not found`);
    }

    return entry;
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const entry = await this.findById(tenantId, id);
    await this.timelineRepository.remove(entry);

    this.logger.log(
      `Deleted timeline entry (${id}) for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('breach.timeline.entry_deleted', {
      key: id,
      value: {
        eventType: 'breach.timeline.entry_deleted',
        tenantId,
        userId,
        timelineEntryId: id,
        incidentId: entry.incidentId,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
