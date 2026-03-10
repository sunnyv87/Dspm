import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowInstance } from '../../entities/workflow-instance.entity';
import { WorkflowDefinition } from '../../entities/workflow-definition.entity';
import { InstanceController } from './instance.controller';
import { InstanceService } from './instance.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowInstance, WorkflowDefinition])],
  controllers: [InstanceController],
  providers: [InstanceService],
  exports: [InstanceService],
})
export class InstanceModule {}
