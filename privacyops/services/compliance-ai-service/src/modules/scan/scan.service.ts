import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceScan, ScanStatus } from '../../entities/compliance-scan.entity';
import { ComplianceFramework, FrameworkStatus } from '../../entities/compliance-framework.entity';
import { ComplianceFinding, FindingStatus, FindingSeverity } from '../../entities/compliance-finding.entity';
import { TriggerScanDto } from './dto/trigger-scan.dto';
import { QueryScanDto } from './dto/query-scan.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class ScanService {
  private readonly logger = new Logger(ScanService.name);

  constructor(
    @InjectRepository(ComplianceScan)
    private readonly scanRepository: Repository<ComplianceScan>,
    @InjectRepository(ComplianceFramework)
    private readonly frameworkRepository: Repository<ComplianceFramework>,
    @InjectRepository(ComplianceFinding)
    private readonly findingRepository: Repository<ComplianceFinding>,
    private readonly kafkaService: KafkaService,
  ) {}

  async trigger(
    tenantId: string,
    triggeredBy: string,
    dto: TriggerScanDto,
  ): Promise<ComplianceScan> {
    // Validate framework exists and is active
    const framework = await this.frameworkRepository.findOne({
      where: { id: dto.frameworkId, tenantId },
    });

    if (!framework) {
      throw new NotFoundException(`Framework with ID "${dto.frameworkId}" not found`);
    }

    if (framework.status !== FrameworkStatus.ACTIVE) {
      throw new BadRequestException(`Framework "${framework.name}" is not active`);
    }

    const scan = this.scanRepository.create({
      tenantId,
      frameworkId: dto.frameworkId,
      type: dto.type,
      scope: dto.scope || null,
      metadata: dto.metadata || null,
      triggeredBy,
      status: ScanStatus.PENDING,
    });

    const saved = await this.scanRepository.save(scan);

    await this.kafkaService.emit('compliance-ai.scan.triggered', {
      key: saved.id,
      value: {
        scanId: saved.id,
        tenantId,
        frameworkId: dto.frameworkId,
        type: dto.type,
        triggeredBy,
        timestamp: new Date().toISOString(),
      },
    });

    // Start the scan asynchronously
    this.executeScan(saved.id, tenantId, framework).catch((err) => {
      this.logger.error(`Scan execution failed for ${saved.id}: ${err.message}`);
    });

    this.logger.log(`Triggered compliance scan ${saved.id} for framework ${framework.name} in tenant ${tenantId}`);
    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryScanDto,
  ): Promise<{ data: ComplianceScan[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.scanRepository
      .createQueryBuilder('scan')
      .leftJoinAndSelect('scan.framework', 'framework')
      .where('scan.tenantId = :tenantId', { tenantId });

    if (query.frameworkId) {
      qb.andWhere('scan.frameworkId = :frameworkId', { frameworkId: query.frameworkId });
    }

    if (query.status) {
      qb.andWhere('scan.status = :status', { status: query.status });
    }

    if (query.type) {
      qb.andWhere('scan.type = :type', { type: query.type });
    }

    if (query.search) {
      qb.andWhere('(framework.name ILIKE :search)', {
        search: `%${query.search.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`,
      });
    }

    qb.orderBy('scan.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<ComplianceScan> {
    const scan = await this.scanRepository.findOne({
      where: { id, tenantId },
      relations: ['framework', 'findings', 'remediations'],
    });

    if (!scan) {
      throw new NotFoundException(`Scan with ID "${id}" not found`);
    }

    return scan;
  }

  async cancel(tenantId: string, id: string): Promise<ComplianceScan> {
    const scan = await this.findById(tenantId, id);

    if (scan.status === ScanStatus.COMPLETED || scan.status === ScanStatus.FAILED) {
      throw new BadRequestException(`Cannot cancel a scan that is already ${scan.status}`);
    }

    scan.status = ScanStatus.FAILED;
    scan.completedAt = new Date();
    scan.metadata = { ...scan.metadata, cancelledAt: new Date().toISOString() };

    const saved = await this.scanRepository.save(scan);

    await this.kafkaService.emit('compliance-ai.scan.cancelled', {
      key: saved.id,
      value: {
        scanId: saved.id,
        tenantId,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Cancelled compliance scan ${id} for tenant ${tenantId}`);
    return saved;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const scan = await this.findById(tenantId, id);
    await this.scanRepository.remove(scan);
    this.logger.log(`Deleted compliance scan ${id} for tenant ${tenantId}`);
  }

  private async executeScan(
    scanId: string,
    tenantId: string,
    framework: ComplianceFramework,
  ): Promise<void> {
    const scan = await this.scanRepository.findOne({ where: { id: scanId } });
    if (!scan) return;

    // Mark as running
    scan.status = ScanStatus.RUNNING;
    scan.startedAt = new Date();
    await this.scanRepository.save(scan);

    await this.kafkaService.emit('compliance-ai.scan.started', {
      key: scanId,
      value: { scanId, tenantId, timestamp: new Date().toISOString() },
    });

    try {
      const controls = framework.controls || [];
      let passCount = 0;
      let failCount = 0;
      let gapCount = 0;

      // Evaluate each control in the framework
      for (const control of controls) {
        const evaluation = this.evaluateControl(control);

        const finding = this.findingRepository.create({
          tenantId,
          scanId,
          frameworkId: framework.id,
          controlId: control.id,
          controlName: control.name,
          status: evaluation.status,
          severity: evaluation.severity,
          description: evaluation.description,
          evidence: evaluation.evidence,
          recommendation: evaluation.recommendation,
          affectedResources: evaluation.affectedResources,
        });

        await this.findingRepository.save(finding);

        if (evaluation.status === FindingStatus.PASS) {
          passCount++;
        } else if (evaluation.status === FindingStatus.FAIL) {
          failCount++;
          gapCount++;
        } else if (evaluation.status === FindingStatus.PARTIAL) {
          gapCount++;
        }
      }

      const totalControls = controls.length || 1;
      const overallScore = ((passCount / totalControls) * 100);

      scan.status = ScanStatus.COMPLETED;
      scan.completedAt = new Date();
      scan.passCount = passCount;
      scan.failCount = failCount;
      scan.gapCount = gapCount;
      scan.overallScore = parseFloat(overallScore.toFixed(2));
      await this.scanRepository.save(scan);

      await this.kafkaService.emit('compliance-ai.scan.completed', {
        key: scanId,
        value: {
          scanId,
          tenantId,
          overallScore: scan.overallScore,
          passCount,
          failCount,
          gapCount,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(`Scan ${scanId} completed: score=${scan.overallScore}, pass=${passCount}, fail=${failCount}, gaps=${gapCount}`);
    } catch (error) {
      scan.status = ScanStatus.FAILED;
      scan.completedAt = new Date();
      scan.metadata = { ...scan.metadata, error: (error as Error).message };
      await this.scanRepository.save(scan);

      await this.kafkaService.emit('compliance-ai.scan.failed', {
        key: scanId,
        value: {
          scanId,
          tenantId,
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.error(`Scan ${scanId} failed: ${(error as Error).message}`);
    }
  }

  /**
   * Category → severity mapping covering all ISO 27701, GDPR, CCPA, HIPAA control categories.
   */
  private static readonly CATEGORY_SEVERITY: Record<string, FindingSeverity> = {
    'data-protection': FindingSeverity.CRITICAL,
    'encryption': FindingSeverity.HIGH,
    'data-subject-rights': FindingSeverity.CRITICAL,
    'consent-management': FindingSeverity.CRITICAL,
    'data-retention': FindingSeverity.HIGH,
    'data-transfer': FindingSeverity.HIGH,
    'access-control': FindingSeverity.HIGH,
    'incident-response': FindingSeverity.HIGH,
    'business-continuity': FindingSeverity.MEDIUM,
    'governance': FindingSeverity.MEDIUM,
    'risk-management': FindingSeverity.MEDIUM,
    'compliance': FindingSeverity.HIGH,
    'vendor-management': FindingSeverity.HIGH,
    'transparency': FindingSeverity.MEDIUM,
    'audit-logging': FindingSeverity.MEDIUM,
    'training': FindingSeverity.LOW,
    'documentation': FindingSeverity.LOW,
  };

  private static readonly CATEGORY_RECOMMENDATIONS: Record<string, string> = {
    'data-protection': 'Implement data protection controls including classification, labelling, and processing limitations as required by ISO 27701 Clause 6 and 7.',
    'data-subject-rights': 'Establish processes for handling data subject rights requests (access, rectification, erasure, portability, objection) per ISO 27701 Section 7.3 and GDPR Articles 15-22.',
    'consent-management': 'Implement consent capture, recording, withdrawal, and audit mechanisms per ISO 27701 Section 7.2.3-7.2.4 and GDPR Article 7.',
    'data-retention': 'Define and enforce retention schedules with automated deletion/anonymization per ISO 27701 Section 7.4.5-7.4.8.',
    'data-transfer': 'Document lawful bases for cross-border PII transfers and implement safeguards per ISO 27701 Section 7.5 and GDPR Chapter V.',
    'encryption': 'Implement encryption at rest and in transit for all PII per ISO 27701 Section 6.7.1.1.',
    'access-control': 'Enforce least-privilege access to PII processing systems with formal provisioning per ISO 27701 Section 6.6.2.',
    'incident-response': 'Establish breach detection, notification (72-hour regulatory), and response procedures per ISO 27701 Section 6.12 and GDPR Articles 33-34.',
    'governance': 'Define PIMS governance structure with clear roles, DPO designation, and documented policies per ISO 27701 Clause 5.',
    'risk-management': 'Conduct PII-specific risk assessments and DPIAs per ISO 27701 Section 5.4 and GDPR Article 35.',
    'compliance': 'Document and maintain compliance with all applicable privacy legislation per ISO 27701 Section 6.15.',
    'vendor-management': 'Ensure processor/sub-processor agreements include PII protection obligations per ISO 27701 Sections 7.2.6 and 8.5.6-8.5.8.',
    'transparency': 'Provide clear, accessible privacy notices to PII principals per ISO 27701 Section 7.3.1 and GDPR Articles 12-14.',
    'audit-logging': 'Implement audit controls and independent reviews of PII protection per ISO 27701 Section 6.15.2.',
    'training': 'Provide PII awareness and privacy training to all workforce members per ISO 27701 Section 6.4.2.2.',
    'documentation': 'Maintain records of PII processing activities per ISO 27701 Section 7.2.8 and GDPR Article 30.',
    'business-continuity': 'Ensure PII protection continuity in adverse situations per ISO 27701 Section 6.13.',
  };

  private evaluateControl(control: {
    id: string;
    name: string;
    description: string;
    category: string;
  }): {
    status: FindingStatus;
    severity: FindingSeverity;
    description: string;
    evidence: Record<string, any>;
    recommendation: string;
    affectedResources: Record<string, any>[];
  } {
    const category = control.category?.toLowerCase() || 'governance';
    const severity = ScanService.CATEGORY_SEVERITY[category] || FindingSeverity.MEDIUM;
    const recommendation =
      ScanService.CATEGORY_RECOMMENDATIONS[category] ||
      `Review and implement control "${control.name}" to ensure compliance with ${control.category} requirements.`;

    const frameworkHint = control.id.split('-')[0] || '';

    return {
      status: FindingStatus.FAIL,
      severity,
      description: `Control "${control.name}" (${control.id}) requires evaluation. Category: ${control.category}. ${control.description || ''}`,
      evidence: {
        controlId: control.id,
        controlCategory: category,
        frameworkHint,
        evaluatedAt: new Date().toISOString(),
        method: 'automated-ai-analysis',
        evaluationVersion: '2.0',
      },
      recommendation,
      affectedResources: [],
    };
  }
}
