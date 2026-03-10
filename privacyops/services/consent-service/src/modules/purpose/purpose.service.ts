import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentPurpose } from '../../entities/consent-purpose.entity';
import { PolicyVersion } from '../../entities/policy-version.entity';
import { CreatePurposeDto } from './dto/create-purpose.dto';
import { UpdatePurposeDto } from './dto/update-purpose.dto';
import { QueryPurposeDto } from './dto/query-purpose.dto';

@Injectable()
export class PurposeService {
  private readonly logger = new Logger(PurposeService.name);

  constructor(
    @InjectRepository(ConsentPurpose)
    private readonly purposeRepository: Repository<ConsentPurpose>,
    @InjectRepository(PolicyVersion)
    private readonly policyVersionRepository: Repository<PolicyVersion>,
  ) {}

  async create(
    tenantId: string,
    createdBy: string,
    dto: CreatePurposeDto,
  ): Promise<ConsentPurpose> {
    const slug = this.generateSlug(dto.name);

    const existing = await this.purposeRepository.findOne({
      where: { tenantId, slug },
    });

    if (existing) {
      throw new ConflictException(`Purpose with slug "${slug}" already exists for this tenant`);
    }

    const purpose = this.purposeRepository.create({
      tenantId,
      createdBy,
      name: dto.name,
      slug,
      description: dto.description,
      legalBasis: dto.legalBasis,
      dataCategories: dto.dataCategories || [],
      retentionPeriodDays: dto.retentionPeriodDays || null,
      isMandatory: dto.isMandatory || false,
      regulatoryFrameworks: dto.regulatoryFrameworks || [],
      thirdPartyRecipients: dto.thirdPartyRecipients || [],
      crossBorderTransfers: dto.crossBorderTransfers || [],
      processingActivityIds: dto.processingActivityIds || [],
      version: 1,
    });

    const saved = await this.purposeRepository.save(purpose);
    this.logger.log(`Created purpose "${saved.name}" (${saved.id}) for tenant ${tenantId}`);
    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryPurposeDto,
  ): Promise<{ data: ConsentPurpose[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.purposeRepository
      .createQueryBuilder('purpose')
      .where('purpose.tenantId = :tenantId', { tenantId });

    if (query.search) {
      qb.andWhere('(purpose.name ILIKE :search OR purpose.description ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.legalBasis) {
      qb.andWhere('purpose.legalBasis = :legalBasis', { legalBasis: query.legalBasis });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('purpose.isActive = :isActive', { isActive: query.isActive });
    }

    if (query.isMandatory !== undefined) {
      qb.andWhere('purpose.isMandatory = :isMandatory', { isMandatory: query.isMandatory });
    }

    qb.orderBy('purpose.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<ConsentPurpose> {
    const purpose = await this.purposeRepository.findOne({
      where: { id, tenantId },
      relations: ['policyVersions'],
    });

    if (!purpose) {
      throw new NotFoundException(`Purpose with ID "${id}" not found`);
    }

    return purpose;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdatePurposeDto,
  ): Promise<ConsentPurpose> {
    const purpose = await this.findById(tenantId, id);

    if (dto.name && dto.name !== purpose.name) {
      const newSlug = this.generateSlug(dto.name);
      const existing = await this.purposeRepository.findOne({
        where: { tenantId, slug: newSlug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Purpose with slug "${newSlug}" already exists for this tenant`);
      }
      purpose.slug = newSlug;
    }

    Object.assign(purpose, {
      ...dto,
      slug: purpose.slug,
    });

    const saved = await this.purposeRepository.save(purpose);
    this.logger.log(`Updated purpose "${saved.name}" (${saved.id}) for tenant ${tenantId}`);
    return saved;
  }

  async deactivate(tenantId: string, id: string): Promise<ConsentPurpose> {
    const purpose = await this.findById(tenantId, id);
    purpose.isActive = false;
    const saved = await this.purposeRepository.save(purpose);
    this.logger.log(`Deactivated purpose "${saved.name}" (${saved.id}) for tenant ${tenantId}`);
    return saved;
  }

  async createNewVersion(
    tenantId: string,
    id: string,
    createdBy: string,
    dto: CreatePurposeDto,
  ): Promise<ConsentPurpose> {
    const previousPurpose = await this.findById(tenantId, id);

    // Deactivate previous version
    previousPurpose.isActive = false;
    await this.purposeRepository.save(previousPurpose);

    const slug = this.generateSlug(dto.name);

    // Check slug uniqueness only if different from previous
    if (slug !== previousPurpose.slug) {
      const existing = await this.purposeRepository.findOne({
        where: { tenantId, slug },
      });
      if (existing) {
        throw new ConflictException(`Purpose with slug "${slug}" already exists for this tenant`);
      }
    }

    const newPurpose = this.purposeRepository.create({
      tenantId,
      createdBy,
      name: dto.name,
      slug,
      description: dto.description,
      legalBasis: dto.legalBasis,
      dataCategories: dto.dataCategories || previousPurpose.dataCategories,
      retentionPeriodDays: dto.retentionPeriodDays ?? previousPurpose.retentionPeriodDays,
      isMandatory: dto.isMandatory ?? previousPurpose.isMandatory,
      regulatoryFrameworks: dto.regulatoryFrameworks || previousPurpose.regulatoryFrameworks,
      thirdPartyRecipients: dto.thirdPartyRecipients || previousPurpose.thirdPartyRecipients,
      crossBorderTransfers: dto.crossBorderTransfers || previousPurpose.crossBorderTransfers,
      processingActivityIds: dto.processingActivityIds || previousPurpose.processingActivityIds,
      version: previousPurpose.version + 1,
      previousVersionId: previousPurpose.id,
      isActive: true,
    });

    const saved = await this.purposeRepository.save(newPurpose);
    this.logger.log(
      `Created new version (v${saved.version}) of purpose "${saved.name}" (${saved.id}) for tenant ${tenantId}`,
    );
    return saved;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
