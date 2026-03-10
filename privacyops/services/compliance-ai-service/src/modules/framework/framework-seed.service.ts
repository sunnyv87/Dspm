import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceFramework, FrameworkStatus } from '../../entities/compliance-framework.entity';
import { FRAMEWORK_SEEDS, ALL_FRAMEWORK_NAMES } from './seed/framework-seeds';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class FrameworkSeedService {
  private readonly logger = new Logger(FrameworkSeedService.name);

  constructor(
    @InjectRepository(ComplianceFramework)
    private readonly frameworkRepository: Repository<ComplianceFramework>,
    private readonly kafkaService: KafkaService,
  ) {}

  /**
   * Seed a specific framework for a tenant.
   * Returns the created framework or throws ConflictException if it already exists.
   */
  async seedFramework(
    tenantId: string,
    frameworkName: string,
  ): Promise<ComplianceFramework> {
    const seed = FRAMEWORK_SEEDS[frameworkName];
    if (!seed) {
      const available = ALL_FRAMEWORK_NAMES.join(', ');
      throw new Error(
        `Unknown framework "${frameworkName}". Available: ${available}`,
      );
    }

    const existing = await this.frameworkRepository.findOne({
      where: { tenantId, name: seed.name },
    });

    if (existing) {
      throw new ConflictException(
        `Framework "${seed.name}" already exists for this tenant. Use update instead.`,
      );
    }

    const framework = this.frameworkRepository.create({
      tenantId,
      name: seed.name,
      version: seed.version,
      description: seed.description,
      status: FrameworkStatus.ACTIVE,
      controls: seed.controls,
    });

    const saved = await this.frameworkRepository.save(framework);

    await this.kafkaService.emit('compliance-ai.framework.seeded', {
      key: saved.id,
      value: {
        frameworkId: saved.id,
        tenantId,
        name: saved.name,
        version: saved.version,
        controlCount: saved.controls.length,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(
      `Seeded framework "${saved.name}" v${saved.version} with ${saved.controls.length} controls for tenant ${tenantId}`,
    );
    return saved;
  }

  /**
   * Seed all available frameworks for a tenant.
   * Skips frameworks that already exist.
   */
  async seedAllFrameworks(
    tenantId: string,
  ): Promise<{ seeded: string[]; skipped: string[] }> {
    const seeded: string[] = [];
    const skipped: string[] = [];

    for (const name of ALL_FRAMEWORK_NAMES) {
      const existing = await this.frameworkRepository.findOne({
        where: { tenantId, name: FRAMEWORK_SEEDS[name].name },
      });

      if (existing) {
        skipped.push(name);
        continue;
      }

      await this.seedFramework(tenantId, name);
      seeded.push(name);
    }

    this.logger.log(
      `Seeded ${seeded.length} frameworks for tenant ${tenantId}. Skipped: ${skipped.length}`,
    );
    return { seeded, skipped };
  }

  /**
   * List all available framework seeds with their control counts.
   */
  getAvailableSeeds(): { name: string; version: string; description: string; controlCount: number }[] {
    return ALL_FRAMEWORK_NAMES.map((name) => ({
      name: FRAMEWORK_SEEDS[name].name,
      version: FRAMEWORK_SEEDS[name].version,
      description: FRAMEWORK_SEEDS[name].description,
      controlCount: FRAMEWORK_SEEDS[name].controls.length,
    }));
  }
}
