import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorQuestionnaire } from '../../entities/vendor-questionnaire.entity';
import { Vendor } from '../../entities/vendor.entity';
import { VendorAssessment } from '../../entities/vendor-assessment.entity';
import { QuestionnaireController } from './questionnaire.controller';
import { QuestionnaireService } from './questionnaire.service';

@Module({
  imports: [TypeOrmModule.forFeature([VendorQuestionnaire, Vendor, VendorAssessment])],
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService],
  exports: [QuestionnaireService],
})
export class QuestionnaireModule {}
