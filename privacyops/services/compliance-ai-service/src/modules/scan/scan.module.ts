import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceScan } from '../../entities/compliance-scan.entity';
import { ComplianceFramework } from '../../entities/compliance-framework.entity';
import { ComplianceFinding } from '../../entities/compliance-finding.entity';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';

@Module({
  imports: [TypeOrmModule.forFeature([ComplianceScan, ComplianceFramework, ComplianceFinding])],
  controllers: [ScanController],
  providers: [ScanService],
  exports: [ScanService],
})
export class ScanModule {}
