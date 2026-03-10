import { IsOptional, IsString, IsEnum, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FindingStatus, FindingSeverity } from '../../../entities/compliance-finding.entity';

export class QueryFindingDto {
  @ApiPropertyOptional({ description: 'Filter by scan ID' })
  @IsOptional()
  @IsUUID()
  scanId?: string;

  @ApiPropertyOptional({ description: 'Filter by framework ID' })
  @IsOptional()
  @IsUUID()
  frameworkId?: string;

  @ApiPropertyOptional({ description: 'Filter by finding status', enum: FindingStatus })
  @IsOptional()
  @IsEnum(FindingStatus)
  status?: FindingStatus;

  @ApiPropertyOptional({ description: 'Filter by severity', enum: FindingSeverity })
  @IsOptional()
  @IsEnum(FindingSeverity)
  severity?: FindingSeverity;

  @ApiPropertyOptional({ description: 'Filter by control ID' })
  @IsOptional()
  @IsString()
  controlId?: string;

  @ApiPropertyOptional({ description: 'Search by control name or description' })
  @IsOptional()
  @IsString()
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
