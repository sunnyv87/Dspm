import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyVersion } from '../../entities/policy-version.entity';
import { ConsentPurpose } from '../../entities/consent-purpose.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { QueryPolicyDto } from './dto/query-policy.dto';

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);

  constructor(
    @InjectRepository(PolicyVersion)
    private readonly policyRepository: Repository<PolicyVersion>,
    @InjectRepository(ConsentPurpose)
    private readonly purposeRepository: Repository<ConsentPurpose>,
  ) {}

  async create(
    tenantId: string,
    createdBy: string,
    dto: CreatePolicyDto,
  ): Promise<PolicyVersion> {
    // Verify purpose exists and belongs to tenant
    const purpose = await this.purposeRepository.findOne({
      where: { id: dto.purposeId, tenantId },
    });

    if (!purpose) {
      throw new NotFoundException(`Purpose with ID "${dto.purposeId}" not found`);
    }

    // Get the latest version number for this purpose
    const latestPolicy = await this.policyRepository
      .createQueryBuilder('policy')
      .where('policy.tenantId = :tenantId', { tenantId })
      .andWhere('policy.purposeId = :purposeId', { purposeId: dto.purposeId })
      .orderBy('policy.version', 'DESC')
      .getOne();

    const nextVersion = latestPolicy ? latestPolicy.version + 1 : 1;

    // If this new policy is active, deactivate all previous active policies for this purpose
    if (dto.isActive !== false) {
      await this.policyRepository
        .createQueryBuilder()
        .update(PolicyVersion)
        .set({ isActive: false })
        .where('tenantId = :tenantId', { tenantId })
        .andWhere('purposeId = :purposeId', { purposeId: dto.purposeId })
        .andWhere('isActive = :isActive', { isActive: true })
        .execute();
    }

    const policy = this.policyRepository.create({
      tenantId,
      createdBy,
      purposeId: dto.purposeId,
      version: nextVersion,
      language: dto.language || 'en',
      title: dto.title,
      contentMarkdown: dto.contentMarkdown,
      contentHtml: dto.contentHtml || null,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      isActive: dto.isActive !== false,
    });

    const saved = await this.policyRepository.save(policy);
    this.logger.log(
      `Created policy version v${saved.version} for purpose ${dto.purposeId} in tenant ${tenantId}`,
    );
    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryPolicyDto,
  ): Promise<{ data: PolicyVersion[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.policyRepository
      .createQueryBuilder('policy')
      .leftJoinAndSelect('policy.purpose', 'purpose')
      .where('policy.tenantId = :tenantId', { tenantId });

    if (query.purposeId) {
      qb.andWhere('policy.purposeId = :purposeId', { purposeId: query.purposeId });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('policy.isActive = :isActive', { isActive: query.isActive });
    }

    if (query.language) {
      qb.andWhere('policy.language = :language', { language: query.language });
    }

    qb.orderBy('policy.version', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<PolicyVersion> {
    const policy = await this.policyRepository.findOne({
      where: { id, tenantId },
      relations: ['purpose'],
    });

    if (!policy) {
      throw new NotFoundException(`Policy version with ID "${id}" not found`);
    }

    return policy;
  }

  async findActiveByPurpose(tenantId: string, purposeId: string): Promise<PolicyVersion> {
    const policy = await this.policyRepository.findOne({
      where: { tenantId, purposeId, isActive: true },
      relations: ['purpose'],
      order: { version: 'DESC' },
    });

    if (!policy) {
      throw new NotFoundException(`No active policy found for purpose "${purposeId}"`);
    }

    return policy;
  }

  async update(
    tenantId: string,
    id: string,
    dto: Partial<CreatePolicyDto>,
  ): Promise<PolicyVersion> {
    const policy = await this.findById(tenantId, id);

    // If activating this policy, deactivate others for the same purpose
    if (dto.isActive === true && !policy.isActive) {
      await this.policyRepository
        .createQueryBuilder()
        .update(PolicyVersion)
        .set({ isActive: false })
        .where('tenantId = :tenantId', { tenantId })
        .andWhere('purposeId = :purposeId', { purposeId: policy.purposeId })
        .andWhere('isActive = :isActive', { isActive: true })
        .execute();
    }

    if (dto.title !== undefined) policy.title = dto.title;
    if (dto.contentMarkdown !== undefined) policy.contentMarkdown = dto.contentMarkdown;
    if (dto.contentHtml !== undefined) policy.contentHtml = dto.contentHtml;
    if (dto.effectiveFrom !== undefined) policy.effectiveFrom = new Date(dto.effectiveFrom);
    if (dto.effectiveTo !== undefined) policy.effectiveTo = dto.effectiveTo ? new Date(dto.effectiveTo) : null;
    if (dto.isActive !== undefined) policy.isActive = dto.isActive;
    if (dto.language !== undefined) policy.language = dto.language;

    const saved = await this.policyRepository.save(policy);
    this.logger.log(`Updated policy version ${saved.id} for tenant ${tenantId}`);
    return saved;
  }
}
