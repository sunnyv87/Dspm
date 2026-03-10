import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RemediationSuggestion, RemediationPriority } from '../../entities/remediation-suggestion.entity';
import { ComplianceFinding, FindingSeverity } from '../../entities/compliance-finding.entity';
import { ComplianceScan } from '../../entities/compliance-scan.entity';
import { GenerateRemediationDto, UpdateRemediationStatusDto } from './dto/generate-remediation.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class RemediationService {
  private readonly logger = new Logger(RemediationService.name);

  constructor(
    @InjectRepository(RemediationSuggestion)
    private readonly remediationRepository: Repository<RemediationSuggestion>,
    @InjectRepository(ComplianceFinding)
    private readonly findingRepository: Repository<ComplianceFinding>,
    @InjectRepository(ComplianceScan)
    private readonly scanRepository: Repository<ComplianceScan>,
    private readonly kafkaService: KafkaService,
  ) {}

  async generate(
    tenantId: string,
    dto: GenerateRemediationDto,
  ): Promise<RemediationSuggestion> {
    // Validate finding exists
    const finding = await this.findingRepository.findOne({
      where: { id: dto.findingId, tenantId },
    });

    if (!finding) {
      throw new NotFoundException(`Finding with ID "${dto.findingId}" not found`);
    }

    // Validate scan exists
    const scan = await this.scanRepository.findOne({
      where: { id: dto.scanId, tenantId },
    });

    if (!scan) {
      throw new NotFoundException(`Scan with ID "${dto.scanId}" not found`);
    }

    // AI-generated remediation content
    const aiGenerated = this.generateAiRemediation(finding);

    const remediation = this.remediationRepository.create({
      tenantId,
      findingId: dto.findingId,
      scanId: dto.scanId,
      title: dto.title || aiGenerated.title,
      description: dto.description || aiGenerated.description,
      priority: dto.priority || aiGenerated.priority,
      estimatedEffort: dto.estimatedEffort || aiGenerated.estimatedEffort,
      assignedTo: dto.assignedTo || null,
      steps: dto.steps || aiGenerated.steps,
      resources: dto.resources || aiGenerated.resources,
    });

    const saved = await this.remediationRepository.save(remediation);

    await this.kafkaService.emit('compliance-ai.remediation.generated', {
      key: saved.id,
      value: {
        remediationId: saved.id,
        findingId: dto.findingId,
        scanId: dto.scanId,
        tenantId,
        priority: saved.priority,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Generated remediation ${saved.id} for finding ${dto.findingId} in tenant ${tenantId}`);
    return saved;
  }

  async generateForScan(
    tenantId: string,
    scanId: string,
  ): Promise<RemediationSuggestion[]> {
    const scan = await this.scanRepository.findOne({
      where: { id: scanId, tenantId },
    });

    if (!scan) {
      throw new NotFoundException(`Scan with ID "${scanId}" not found`);
    }

    const failedFindings = await this.findingRepository.find({
      where: { scanId, tenantId },
    });

    const remediations: RemediationSuggestion[] = [];

    for (const finding of failedFindings) {
      if (finding.status === 'PASS' || finding.status === 'NOT_APPLICABLE') {
        continue;
      }

      const aiGenerated = this.generateAiRemediation(finding);

      const remediation = this.remediationRepository.create({
        tenantId,
        findingId: finding.id,
        scanId,
        title: aiGenerated.title,
        description: aiGenerated.description,
        priority: aiGenerated.priority,
        estimatedEffort: aiGenerated.estimatedEffort,
        steps: aiGenerated.steps,
        resources: aiGenerated.resources,
      });

      const saved = await this.remediationRepository.save(remediation);
      remediations.push(saved);
    }

    await this.kafkaService.emit('compliance-ai.remediation.batch-generated', {
      key: scanId,
      value: {
        scanId,
        tenantId,
        count: remediations.length,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Generated ${remediations.length} remediations for scan ${scanId} in tenant ${tenantId}`);
    return remediations;
  }

  async findAll(
    tenantId: string,
    query: {
      scanId?: string;
      findingId?: string;
      status?: string;
      priority?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: RemediationSuggestion[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.remediationRepository
      .createQueryBuilder('remediation')
      .leftJoinAndSelect('remediation.finding', 'finding')
      .leftJoinAndSelect('remediation.scan', 'scan')
      .where('remediation.tenantId = :tenantId', { tenantId });

    if (query.scanId) {
      qb.andWhere('remediation.scanId = :scanId', { scanId: query.scanId });
    }

    if (query.findingId) {
      qb.andWhere('remediation.findingId = :findingId', { findingId: query.findingId });
    }

    if (query.status) {
      qb.andWhere('remediation.status = :status', { status: query.status });
    }

    if (query.priority) {
      qb.andWhere('remediation.priority = :priority', { priority: query.priority });
    }

    qb.orderBy('remediation.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<RemediationSuggestion> {
    const remediation = await this.remediationRepository.findOne({
      where: { id, tenantId },
      relations: ['finding', 'scan'],
    });

    if (!remediation) {
      throw new NotFoundException(`Remediation with ID "${id}" not found`);
    }

    return remediation;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    dto: UpdateRemediationStatusDto,
  ): Promise<RemediationSuggestion> {
    const remediation = await this.findById(tenantId, id);

    remediation.status = dto.status;
    if (dto.assignedTo) {
      remediation.assignedTo = dto.assignedTo;
    }

    const saved = await this.remediationRepository.save(remediation);

    await this.kafkaService.emit('compliance-ai.remediation.status-updated', {
      key: saved.id,
      value: {
        remediationId: saved.id,
        tenantId,
        status: saved.status,
        assignedTo: saved.assignedTo,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Updated remediation ${id} status to ${dto.status} for tenant ${tenantId}`);
    return saved;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const remediation = await this.findById(tenantId, id);
    await this.remediationRepository.remove(remediation);
    this.logger.log(`Deleted remediation ${id} for tenant ${tenantId}`);
  }

  private generateAiRemediation(finding: ComplianceFinding): {
    title: string;
    description: string;
    priority: RemediationPriority;
    estimatedEffort: string;
    steps: Record<string, any>[];
    resources: Record<string, any>[];
  } {
    // Map finding severity to remediation priority
    const severityToPriority: Record<string, RemediationPriority> = {
      [FindingSeverity.CRITICAL]: RemediationPriority.CRITICAL,
      [FindingSeverity.HIGH]: RemediationPriority.HIGH,
      [FindingSeverity.MEDIUM]: RemediationPriority.MEDIUM,
      [FindingSeverity.LOW]: RemediationPriority.LOW,
      [FindingSeverity.INFO]: RemediationPriority.LOW,
    };

    const effortBySeverity: Record<string, string> = {
      [FindingSeverity.CRITICAL]: '1-2 days',
      [FindingSeverity.HIGH]: '3-5 days',
      [FindingSeverity.MEDIUM]: '1-2 weeks',
      [FindingSeverity.LOW]: '2-4 weeks',
      [FindingSeverity.INFO]: '1 month',
    };

    const priority = severityToPriority[finding.severity] || RemediationPriority.MEDIUM;
    const estimatedEffort = effortBySeverity[finding.severity] || '1-2 weeks';

    return {
      title: `Remediate: ${finding.controlName} (${finding.controlId})`,
      description: `AI-generated remediation for compliance control "${finding.controlName}". ${finding.recommendation || `This control requires attention to ensure compliance. Current status: ${finding.status}.`}`,
      priority,
      estimatedEffort,
      steps: [
        {
          order: 1,
          title: 'Assess current state',
          description: `Review the current implementation status of control ${finding.controlId} (${finding.controlName}).`,
        },
        {
          order: 2,
          title: 'Identify gaps',
          description: `Analyze the specific gaps identified in the compliance finding: ${finding.description || 'No detailed description available.'}`,
        },
        {
          order: 3,
          title: 'Implement controls',
          description: `Implement the necessary technical and procedural controls to address the compliance gap.`,
        },
        {
          order: 4,
          title: 'Validate implementation',
          description: `Verify that the implemented controls satisfy the requirements of ${finding.controlId}.`,
        },
        {
          order: 5,
          title: 'Document evidence',
          description: `Document the remediation actions taken and collect evidence of compliance.`,
        },
      ],
      resources: [
        {
          type: 'documentation',
          title: `${finding.controlId} Control Requirements`,
          description: `Reference documentation for control ${finding.controlName}`,
        },
        {
          type: 'best-practice',
          title: `Industry best practices for ${finding.controlName}`,
          description: `Recommended implementation patterns and best practices`,
        },
      ],
    };
  }
}
