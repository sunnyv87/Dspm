import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassificationPolicy, PolicyRule } from '../../entities/classification-policy.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { TestPolicyDto } from './dto/test-policy.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

export interface TestResult {
  label: string;
  regulationTag: string;
  confidence: number;
  ruleType: string;
  pattern: string;
}

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);

  constructor(
    @InjectRepository(ClassificationPolicy)
    private readonly policyRepo: Repository<ClassificationPolicy>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    dto: CreatePolicyDto,
  ): Promise<ClassificationPolicy> {
    const existing = await this.policyRepo.findOne({
      where: { tenantId, name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Policy with name "${dto.name}" already exists for this tenant`,
      );
    }

    const policy = this.policyRepo.create({
      tenantId,
      createdBy: userId,
      name: dto.name,
      description: dto.description || null,
      rulesJson: dto.rulesJson,
      defaultLabel: dto.defaultLabel || 'unclassified',
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      priority: dto.priority || 0,
    });

    const saved = await this.policyRepo.save(policy);

    await this.kafkaService.emit('classification.policy.created', {
      key: saved.id,
      value: {
        eventType: 'POLICY_CREATED',
        tenantId,
        policyId: saved.id,
        policyName: saved.name,
        createdBy: userId,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Policy "${saved.name}" created for tenant ${tenantId}`);
    return saved;
  }

  async findAll(tenantId: string): Promise<ClassificationPolicy[]> {
    return this.policyRepo.find({
      where: { tenantId },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<ClassificationPolicy> {
    const policy = await this.policyRepo.findOne({
      where: { id, tenantId },
    });
    if (!policy) {
      throw new NotFoundException(`Policy ${id} not found`);
    }
    return policy;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdatePolicyDto,
  ): Promise<ClassificationPolicy> {
    const policy = await this.findOne(tenantId, id);

    if (dto.name && dto.name !== policy.name) {
      const existing = await this.policyRepo.findOne({
        where: { tenantId, name: dto.name },
      });
      if (existing) {
        throw new ConflictException(
          `Policy with name "${dto.name}" already exists for this tenant`,
        );
      }
    }

    Object.assign(policy, dto);
    const saved = await this.policyRepo.save(policy);

    await this.kafkaService.emit('classification.policy.updated', {
      key: saved.id,
      value: {
        eventType: 'POLICY_UPDATED',
        tenantId,
        policyId: saved.id,
        policyName: saved.name,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Policy "${saved.name}" updated for tenant ${tenantId}`);
    return saved;
  }

  async deactivate(tenantId: string, id: string): Promise<ClassificationPolicy> {
    const policy = await this.findOne(tenantId, id);
    policy.isActive = false;
    const saved = await this.policyRepo.save(policy);

    await this.kafkaService.emit('classification.policy.deactivated', {
      key: saved.id,
      value: {
        eventType: 'POLICY_DEACTIVATED',
        tenantId,
        policyId: saved.id,
        policyName: saved.name,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Policy "${saved.name}" deactivated for tenant ${tenantId}`);
    return saved;
  }

  async findActivePolicies(tenantId: string): Promise<ClassificationPolicy[]> {
    return this.policyRepo.find({
      where: { tenantId, isActive: true },
      order: { priority: 'DESC' },
    });
  }

  async testPolicy(
    tenantId: string,
    id: string,
    dto: TestPolicyDto,
  ): Promise<TestResult[]> {
    const policy = await this.findOne(tenantId, id);
    const results: TestResult[] = [];

    for (const rule of policy.rulesJson) {
      if (rule.type === 'regex') {
        const regex = new RegExp(rule.pattern, 'gi');
        const searchText = [
          dto.name,
          dto.path || '',
          ...(dto.columnNames || []),
        ].join(' ');
        if (regex.test(searchText)) {
          results.push({
            label: rule.label,
            regulationTag: rule.regulationTag,
            confidence: rule.confidence || 0.8,
            ruleType: rule.type,
            pattern: rule.pattern,
          });
        }
      } else if (rule.type === 'keyword') {
        const keywords = rule.pattern
          .split(',')
          .map((k) => k.trim().toLowerCase());
        const searchText = [dto.name, dto.path || ''].join(' ').toLowerCase();
        if (keywords.some((kw) => searchText.includes(kw))) {
          results.push({
            label: rule.label,
            regulationTag: rule.regulationTag,
            confidence: rule.confidence || 0.7,
            ruleType: rule.type,
            pattern: rule.pattern,
          });
        }
      }
    }

    if (results.length === 0) {
      results.push({
        label: policy.defaultLabel,
        regulationTag: '',
        confidence: 1.0,
        ruleType: 'default',
        pattern: '',
      });
    }

    return results;
  }
}
