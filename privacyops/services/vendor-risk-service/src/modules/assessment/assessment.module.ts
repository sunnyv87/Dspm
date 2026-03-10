import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorAssessment } from '../../entities/vendor-assessment.entity';
import { Vendor } from '../../entities/vendor.entity';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';

@Module({
  imports: [TypeOrmModule.forFeature([VendorAssessment, Vendor])],
  controllers: [AssessmentController],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
