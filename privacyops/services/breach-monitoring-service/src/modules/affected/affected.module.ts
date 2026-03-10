import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffectedDataSubject } from '../../entities/affected-data-subject.entity';
import { BreachIncident } from '../../entities/breach-incident.entity';
import { AffectedController } from './affected.controller';
import { AffectedService } from './affected.service';

@Module({
  imports: [TypeOrmModule.forFeature([AffectedDataSubject, BreachIncident])],
  controllers: [AffectedController],
  providers: [AffectedService],
  exports: [AffectedService],
})
export class AffectedModule {}
