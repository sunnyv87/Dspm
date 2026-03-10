import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassificationRun, RunStatus } from '../../entities/classification-run.entity';
import { ClassificationService } from '../classification/classification.service';
import { TriggerRunDto } from './dto/trigger-run.dto';

@Injectable()
export class RunService {
  private readonly logger = new Logger(RunService.name);

  constructor(
    @InjectRepository(ClassificationRun)
    private readonly runRepo: Repository<ClassificationRun>,
    private readonly classificationService: ClassificationService,
  ) {}

  async triggerRun(
    tenantId: string,
    userId: string,
    dto: TriggerRunDto,
  ): Promise<ClassificationRun> {
    return this.classificationService.bulkApply(tenantId, userId, {
      dataSourceId: dto.dataSourceId,
      policyId: dto.policyId,
      assetIds: dto.assetIds,
    });
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: ClassificationRun[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.runRepo.findAndCount({
      where: { tenantId },
      relations: ['policy'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string): Promise<ClassificationRun> {
    const run = await this.runRepo.findOne({
      where: { id, tenantId },
      relations: ['policy'],
    });
    if (!run) {
      throw new NotFoundException(`Classification run ${id} not found`);
    }
    return run;
  }

  async cancelRun(tenantId: string, id: string): Promise<ClassificationRun> {
    const run = await this.findOne(tenantId, id);

    if (run.status !== RunStatus.QUEUED && run.status !== RunStatus.RUNNING) {
      throw new BadRequestException(
        `Cannot cancel run with status "${run.status}". Only queued or running runs can be cancelled.`,
      );
    }

    run.status = RunStatus.FAILED;
    run.completedAt = new Date();
    const saved = await this.runRepo.save(run);

    this.logger.log(`Classification run ${id} cancelled`);
    return saved;
  }
}
