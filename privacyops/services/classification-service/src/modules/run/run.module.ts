import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassificationRun } from '../../entities/classification-run.entity';
import { RunController } from './run.controller';
import { RunService } from './run.service';
import { ClassificationModule } from '../classification/classification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassificationRun]),
    ClassificationModule,
  ],
  controllers: [RunController],
  providers: [RunService],
  exports: [RunService],
})
export class RunModule {}
