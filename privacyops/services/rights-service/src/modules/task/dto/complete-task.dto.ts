import { IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../../../entities/rights-task.entity';

export class CompleteTaskDto {
  @ApiPropertyOptional({ description: 'Task completion status', enum: [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.SKIPPED] })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ description: 'Task output data' })
  @IsOptional()
  @IsObject()
  output?: Record<string, any>;
}
