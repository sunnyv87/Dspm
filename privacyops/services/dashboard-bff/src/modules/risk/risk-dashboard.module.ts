import { Module } from '@nestjs/common';
import { RiskDashboardController } from './risk-dashboard.controller';
import { RiskDashboardService } from './risk-dashboard.service';

@Module({
  controllers: [RiskDashboardController],
  providers: [RiskDashboardService],
})
export class RiskDashboardModule {}
