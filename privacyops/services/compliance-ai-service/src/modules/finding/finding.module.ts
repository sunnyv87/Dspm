import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceFinding } from '../../entities/compliance-finding.entity';
import { FindingController } from './finding.controller';
import { FindingService } from './finding.service';

@Module({
  imports: [TypeOrmModule.forFeature([ComplianceFinding])],
  controllers: [FindingController],
  providers: [FindingService],
  exports: [FindingService],
})
export class FindingModule {}
