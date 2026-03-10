import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstancePriority } from '../../../entities/workflow-instance.entity';

export class StartInstanceDto {
  @ApiProperty({ description: 'Workflow definition ID' })
  @IsUUID()
  definitionId: string;

  @ApiPropertyOptional({ description: 'Instance priority', enum: InstancePriority })
  @IsOptional()
  @IsEnum(InstancePriority)
  priority?: InstancePriority;

  @ApiPropertyOptional({ description: 'Due date for the workflow instance' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Runtime context/variables for the workflow' })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Parent instance ID for sub-workflows' })
  @IsOptional()
  @IsUUID()
  parentInstanceId?: string;
}
