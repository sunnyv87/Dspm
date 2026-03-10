import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemediationSuggestion } from '../../entities/remediation-suggestion.entity';
import { ComplianceFinding } from '../../entities/compliance-finding.entity';
import { ComplianceScan } from '../../entities/compliance-scan.entity';
import { RemediationController } from './remediation.controller';
import { RemediationService } from './remediation.service';

@Module({
  imports: [TypeOrmModule.forFeature([RemediationSuggestion, ComplianceFinding, ComplianceScan])],
  controllers: [RemediationController],
  providers: [RemediationService],
  exports: [RemediationService],
})
export class RemediationModule {}
