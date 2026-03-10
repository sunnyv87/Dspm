import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassificationTag } from '../../entities/classification-tag.entity';
import { ClassificationReviewItem } from '../../entities/classification-review-item.entity';
import { ClassificationRun } from '../../entities/classification-run.entity';
import { ClassificationPolicy } from '../../entities/classification-policy.entity';
import { ClassificationController } from './classification.controller';
import { ClassificationService } from './classification.service';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassificationTag,
      ClassificationReviewItem,
      ClassificationRun,
      ClassificationPolicy,
    ]),
    PolicyModule,
  ],
  controllers: [ClassificationController],
  providers: [ClassificationService],
  exports: [ClassificationService],
})
export class ClassificationModule {}
