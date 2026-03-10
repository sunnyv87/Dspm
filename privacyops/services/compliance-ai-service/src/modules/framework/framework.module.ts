import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceFramework } from '../../entities/compliance-framework.entity';
import { FrameworkController } from './framework.controller';
import { FrameworkService } from './framework.service';
import { FrameworkSeedService } from './framework-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([ComplianceFramework])],
  controllers: [FrameworkController],
  providers: [FrameworkService, FrameworkSeedService],
  exports: [FrameworkService, FrameworkSeedService],
})
export class FrameworkModule {}
