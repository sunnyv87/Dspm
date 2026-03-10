import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetentionExecution } from '../../entities/retention-execution.entity';
import { RetentionPolicy } from '../../entities/retention-policy.entity';
import { ExecutionController } from './execution.controller';
import { ExecutionService } from './execution.service';

@Module({
  imports: [TypeOrmModule.forFeature([RetentionExecution, RetentionPolicy])],
  controllers: [ExecutionController],
  providers: [ExecutionService],
  exports: [ExecutionService],
})
export class ExecutionModule {}
