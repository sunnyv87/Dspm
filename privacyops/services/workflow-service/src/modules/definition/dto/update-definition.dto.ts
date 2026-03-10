import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  MaxLength,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  WorkflowCategory,
  DefinitionStatus,
} from '../../../entities/workflow-definition.entity';
import { StepDefinitionDto, TriggerDefinitionDto } from './create-definition.dto';

export class UpdateDefinitionDto {
  @ApiPropertyOptional({ description: 'Workflow definition name', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Workflow description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Workflow category', enum: WorkflowCategory })
  @IsOptional()
  @IsEnum(WorkflowCategory)
  category?: WorkflowCategory;

  @ApiPropertyOptional({ description: 'Workflow status', enum: DefinitionStatus })
  @IsOptional()
  @IsEnum(DefinitionStatus)
  status?: DefinitionStatus;

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
