import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  MaxLength,
  MinLength,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WorkflowCategory } from '../../../entities/workflow-definition.entity';

export class StepDefinitionDto {
  @ApiProperty({ description: 'Unique step identifier' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Step name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Step type (e.g., manual, approval, automated)' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Step configuration' })
  @IsOptional()
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'IDs of next steps', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nextSteps?: string[];
}

export class TriggerDefinitionDto {
  @ApiProperty({ description: 'Event name that triggers the workflow' })
  @IsString()
  event: string;

  @ApiPropertyOptional({ description: 'Conditions for the trigger' })
  @IsOptional()
  conditions?: Record<string, any>;
}

export class CreateDefinitionDto {
  @ApiProperty({ description: 'Workflow definition name', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Workflow description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Workflow category', enum: WorkflowCategory })
  @IsEnum(WorkflowCategory)
  category: WorkflowCategory;

  @ApiPropertyOptional({ description: 'Workflow steps', type: [StepDefinitionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDefinitionDto)
  steps?: StepDefinitionDto[];

  @ApiPropertyOptional({ description: 'Workflow triggers', type: [TriggerDefinitionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TriggerDefinitionDto)
  triggers?: TriggerDefinitionDto[];

  @ApiPropertyOptional({ description: 'SLA in hours' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  slaHours?: number;
}
