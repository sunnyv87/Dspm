import { Module } from '@nestjs/common';
import { ComplianceDashboardController } from './compliance-dashboard.controller';
import { ComplianceDashboardService } from './compliance-dashboard.service';

@Module({
  controllers: [ComplianceDashboardController],
  providers: [ComplianceDashboardService],
})
export class ComplianceDashboardModule {}
