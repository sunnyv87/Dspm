import { IsOptional, IsString, IsEnum, IsUUID, IsBoolean, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  SubjectType,
  RiskLevel,
} from '../../../entities/affected-data-subject.entity';

export class QueryAffectedDto {
  @ApiPropertyOptional({ description: 'Filter by incident ID' })
  @IsOptional()
  @IsUUID()
  incidentId?: string;

  @ApiPropertyOptional({ description: 'Filter by subject type', enum: SubjectType })
  @IsOptional()
  @IsEnum(SubjectType)
  subjectType?: SubjectType;

  @ApiPropertyOptional({ description: 'Filter by risk level', enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiPropertyOptional({ description: 'Filter by notification status' })
  @IsOptional()
  @IsBoolean()
  notified?: boolean;

  @ApiPropertyOptional({ description: 'Search by subject identifier' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

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
