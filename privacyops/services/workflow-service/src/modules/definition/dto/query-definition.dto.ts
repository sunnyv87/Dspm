import { IsOptional, IsString, IsEnum, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  WorkflowCategory,
  DefinitionStatus,
} from '../../../entities/workflow-definition.entity';

export class QueryDefinitionDto {
  @ApiPropertyOptional({ description: 'Search by name (partial match)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category', enum: WorkflowCategory })
  @IsOptional()
  @IsEnum(WorkflowCategory)
  category?: WorkflowCategory;

  @ApiPropertyOptional({ description: 'Filter by status', enum: DefinitionStatus })
  @IsOptional()
  @IsEnum(DefinitionStatus)
  status?: DefinitionStatus;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
