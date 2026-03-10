import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AffectedDataSubject } from '../../entities/affected-data-subject.entity';
import { BreachIncident } from '../../entities/breach-incident.entity';
import { RegisterAffectedDto } from './dto/register-affected.dto';
import { QueryAffectedDto } from './dto/query-affected.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class AffectedService {
  private readonly logger = new Logger(AffectedService.name);

  constructor(
    @InjectRepository(AffectedDataSubject)
    private readonly affectedRepository: Repository<AffectedDataSubject>,
    @InjectRepository(BreachIncident)
    private readonly incidentRepository: Repository<BreachIncident>,
    private readonly kafkaService: KafkaService,
  ) {}

  async register(
    tenantId: string,
    userId: string,
    dto: RegisterAffectedDto,
  ): Promise<AffectedDataSubject> {
    // Verify incident exists and belongs to tenant
    const incident = await this.incidentRepository.findOne({
      where: { id: dto.incidentId, tenantId },
    });

    if (!incident) {
      throw new NotFoundException(
        `Breach incident with ID "${dto.incidentId}" not found`,
      );
    }

    const affected = this.affectedRepository.create({
      tenantId,
      incidentId: dto.incidentId,
      subjectIdentifier: dto.subjectIdentifier,
      subjectType: dto.subjectType,
      affectedDataCategories: dto.affectedDataCategories || [],
      riskLevel: dto.riskLevel,
      notified: dto.notified || false,
      notifiedAt: dto.notifiedAt ? new Date(dto.notifiedAt) : null,
    });

    const saved = await this.affectedRepository.save(affected);

    this.logger.log(
      `Registered affected data subject (${saved.id}) for incident ${dto.incidentId} tenant ${tenantId}`,
    );

    await this.kafkaService.emit('breach.affected.registered', {
      key: saved.id,
      value: {
        eventType: 'breach.affected.registered',
        tenantId,
        userId,
        affectedSubjectId: saved.id,
        incidentId: dto.incidentId,
        subjectType: saved.subjectType,
        riskLevel: saved.riskLevel,
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryAffectedDto,
  ): Promise<{ data: AffectedDataSubject[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.affectedRepository
      .createQueryBuilder('affected')
      .where('affected.tenantId = :tenantId', { tenantId });

    if (query.incidentId) {
      qb.andWhere('affected.incidentId = :incidentId', {
        incidentId: query.incidentId,
      });
    }

    if (query.subjectType) {
      qb.andWhere('affected.subjectType = :subjectType', {
        subjectType: query.subjectType,
      });
    }

    if (query.riskLevel) {
      qb.andWhere('affected.riskLevel = :riskLevel', {
        riskLevel: query.riskLevel,
      });
    }

    if (query.notified !== undefined) {
      qb.andWhere('affected.notified = :notified', { notified: query.notified });
    }

    if (query.search) {
      qb.andWhere('affected.subjectIdentifier ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('affected.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<AffectedDataSubject> {
    const affected = await this.affectedRepository.findOne({
      where: { id, tenantId },
      relations: ['incident'],
    });

    if (!affected) {
      throw new NotFoundException(
        `Affected data subject with ID "${id}" not found`,
      );
    }

    return affected;
  }

  async markNotified(
    tenantId: string,
    id: string,
    userId: string,
  ): Promise<AffectedDataSubject> {
    const affected = await this.findById(tenantId, id);

    affected.notified = true;
    affected.notifiedAt = new Date();

    const saved = await this.affectedRepository.save(affected);

    this.logger.log(
      `Marked affected data subject (${saved.id}) as notified for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('breach.affected.notified', {
      key: saved.id,
      value: {
        eventType: 'breach.affected.notified',
        tenantId,
        userId,
        affectedSubjectId: saved.id,
        incidentId: saved.incidentId,
        notifiedAt: saved.notifiedAt.toISOString(),
        timestamp: new Date().toISOString(),
      },
    });

    return saved;
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const affected = await this.findById(tenantId, id);
    await this.affectedRepository.remove(affected);

    this.logger.log(
      `Deleted affected data subject (${id}) for tenant ${tenantId}`,
    );

    await this.kafkaService.emit('breach.affected.deleted', {
      key: id,
      value: {
        eventType: 'breach.affected.deleted',
        tenantId,
        userId,
        affectedSubjectId: id,
        incidentId: affected.incidentId,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
