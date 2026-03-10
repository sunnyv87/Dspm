import { IsOptional, IsString, IsEnum, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  BreachSeverity,
  BreachStatus,
  BreachType,
} from '../../../entities/breach-incident.entity';

export class QueryIncidentDto {
  @ApiPropertyOptional({ description: 'Search by title or description (partial match)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by severity', enum: BreachSeverity })
  @IsOptional()
  @IsEnum(BreachSeverity)
  severity?: BreachSeverity;

  @ApiPropertyOptional({ description: 'Filter by status', enum: BreachStatus })
  @IsOptional()
  @IsEnum(BreachStatus)
  status?: BreachStatus;

  @ApiPropertyOptional({ description: 'Filter by type', enum: BreachType })
  @IsOptional()
  @IsEnum(BreachType)
  type?: BreachType;

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
