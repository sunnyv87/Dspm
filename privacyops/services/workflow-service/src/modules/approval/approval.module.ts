import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRecord } from '../../entities/approval-record.entity';
import { WorkflowTask } from '../../entities/workflow-task.entity';
import { WorkflowInstance } from '../../entities/workflow-instance.entity';
import { ApprovalController } from './approval.controller';
import { ApprovalService } from './approval.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalRecord, WorkflowTask, WorkflowInstance])],
  controllers: [ApprovalController],
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalModule {}
