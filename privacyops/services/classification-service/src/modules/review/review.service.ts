import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ClassificationReviewItem,
  ReviewStatus,
} from '../../entities/classification-review-item.entity';
import {
  ClassificationTag,
  ClassificationSource,
} from '../../entities/classification-tag.entity';
import { KafkaService } from '../../common/kafka/kafka.service';
import { ReviewOverrideDto } from './dto/review-action.dto';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(ClassificationReviewItem)
    private readonly reviewRepo: Repository<ClassificationReviewItem>,
    @InjectRepository(ClassificationTag)
    private readonly tagRepo: Repository<ClassificationTag>,
    private readonly kafkaService: KafkaService,
  ) {}

  async findAll(
    tenantId: string,
    status?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: ClassificationReviewItem[]; total: number; page: number; limit: number }> {
    const qb = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.classificationTag', 'tag')
      .where('review.tenantId = :tenantId', { tenantId });

    if (status) {
      qb.andWhere('review.status = :status', { status });
    }

    qb.orderBy('review.createdAt', 'DESC');

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findOne(
    tenantId: string,
    id: string,
  ): Promise<ClassificationReviewItem> {
    const item = await this.reviewRepo.findOne({
      where: { id, tenantId },
      relations: ['classificationTag'],
    });
    if (!item) {
      throw new NotFoundException(`Review item ${id} not found`);
    }
    return item;
  }

  async approve(
    tenantId: string,
    id: string,
    reviewerId: string,
    reviewNotes?: string,
  ): Promise<ClassificationReviewItem> {
    const item = await this.findOne(tenantId, id);
    this.validateTransition(item.status, ReviewStatus.APPROVED);

    item.status = ReviewStatus.APPROVED;
    item.reviewerId = reviewerId;
    item.reviewedAt = new Date();
    item.reviewNotes = reviewNotes || null;

    const saved = await this.reviewRepo.save(item);

    // Mark the classification tag as reviewed
    await this.tagRepo.update(
      { id: item.classificationTagId },
      {
        reviewerId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || 'Approved via review queue',
      },
    );

    await this.kafkaService.emit('classification.review.approved', {
      key: id,
      value: {
        eventType: 'REVIEW_APPROVED',
        tenantId,
        reviewItemId: id,
        classificationTagId: item.classificationTagId,
        assetId: item.assetId,
        label: item.currentLabel,
        reviewerId,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Review item ${id} approved by ${reviewerId}`);
    return saved;
  }

  async reject(
    tenantId: string,
    id: string,
    reviewerId: string,
    reviewNotes?: string,
  ): Promise<ClassificationReviewItem> {
    const item = await this.findOne(tenantId, id);
    this.validateTransition(item.status, ReviewStatus.REJECTED);

    item.status = ReviewStatus.REJECTED;
    item.reviewerId = reviewerId;
    item.reviewedAt = new Date();
    item.reviewNotes = reviewNotes || null;

    const saved = await this.reviewRepo.save(item);

    await this.kafkaService.emit('classification.review.rejected', {
      key: id,
      value: {
        eventType: 'REVIEW_REJECTED',
        tenantId,
        reviewItemId: id,
        classificationTagId: item.classificationTagId,
        assetId: item.assetId,
        label: item.currentLabel,
        reviewerId,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(`Review item ${id} rejected by ${reviewerId}`);
    return saved;
  }

  async override(
    tenantId: string,
    id: string,
    reviewerId: string,
    dto: ReviewOverrideDto,
  ): Promise<ClassificationReviewItem> {
    const item = await this.findOne(tenantId, id);
    this.validateTransition(item.status, ReviewStatus.OVERRIDDEN);

    const previousLabel = item.currentLabel;

    item.status = ReviewStatus.OVERRIDDEN;
    item.reviewerId = reviewerId;
    item.reviewedAt = new Date();
    item.reviewNotes = dto.reviewNotes || null;

    const saved = await this.reviewRepo.save(item);

    // Update the classification tag
    const tag = await this.tagRepo.findOne({
      where: { id: item.classificationTagId },
    });
    if (tag) {
      tag.previousLabel = tag.label;
      tag.label = dto.newLabel;
      tag.regulationTag = dto.regulationTag || tag.regulationTag;
      tag.source = ClassificationSource.MANUAL;
      tag.confidenceScore = 1.0;
      tag.reviewerId = reviewerId;
      tag.reviewedAt = new Date();
      tag.reviewNotes = dto.reviewNotes || `Overridden via review: "${previousLabel}" -> "${dto.newLabel}"`;
      await this.tagRepo.save(tag);
    }

    await this.kafkaService.emit('classification.review.overridden', {
      key: id,
      value: {
        eventType: 'REVIEW_OVERRIDDEN',
        tenantId,
        reviewItemId: id,
        classificationTagId: item.classificationTagId,
        assetId: item.assetId,
        previousLabel,
        newLabel: dto.newLabel,
        reviewerId,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.log(
      `Review item ${id} overridden: "${previousLabel}" -> "${dto.newLabel}" by ${reviewerId}`,
    );
    return saved;
  }

  async getStats(tenantId: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    overridden: number;
  }> {
    const total = await this.reviewRepo.count({ where: { tenantId } });
    const pending = await this.reviewRepo.count({
      where: { tenantId, status: ReviewStatus.PENDING },
    });
    const approved = await this.reviewRepo.count({
      where: { tenantId, status: ReviewStatus.APPROVED },
    });
    const rejected = await this.reviewRepo.count({
      where: { tenantId, status: ReviewStatus.REJECTED },
    });
    const overridden = await this.reviewRepo.count({
      where: { tenantId, status: ReviewStatus.OVERRIDDEN },
    });

    return { total, pending, approved, rejected, overridden };
  }

  private validateTransition(
    currentStatus: ReviewStatus,
    targetStatus: ReviewStatus,
  ): void {
    if (currentStatus !== ReviewStatus.PENDING) {
      throw new BadRequestException(
        `Cannot transition from "${currentStatus}" to "${targetStatus}". Only pending items can be reviewed.`,
      );
    }
  }
}
