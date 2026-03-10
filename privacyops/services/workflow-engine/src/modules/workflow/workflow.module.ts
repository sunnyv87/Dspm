import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { StepExecutor } from './step-executor.service';
import { WorkflowEntity } from '../../entities/workflow.entity';
import { WorkflowStepEntity } from '../../entities/workflow-step.entity';
import { WorkflowTemplateEntity } from '../../entities/workflow-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowEntity, WorkflowStepEntity, WorkflowTemplateEntity])],
  controllers: [WorkflowController],
  providers: [WorkflowService, StepExecutor],
  exports: [WorkflowService],
})
export class WorkflowModule {}
