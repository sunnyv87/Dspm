import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiskFinding } from '../../entities/risk-finding.entity';
import { Vendor } from '../../entities/vendor.entity';
import { VendorAssessment } from '../../entities/vendor-assessment.entity';
import { FindingController } from './finding.controller';
import { FindingService } from './finding.service';

@Module({
  imports: [TypeOrmModule.forFeature([RiskFinding, Vendor, VendorAssessment])],
  controllers: [FindingController],
  providers: [FindingService],
  exports: [FindingService],
})
export class FindingModule {}
