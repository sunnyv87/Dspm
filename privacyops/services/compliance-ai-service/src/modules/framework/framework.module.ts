import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceFramework } from '../../entities/compliance-framework.entity';
import { FrameworkController } from './framework.controller';
import { FrameworkService } from './framework.service';

@Module({
  imports: [TypeOrmModule.forFeature([ComplianceFramework])],
  controllers: [FrameworkController],
  providers: [FrameworkService],
  exports: [FrameworkService],
})
export class FrameworkModule {}
