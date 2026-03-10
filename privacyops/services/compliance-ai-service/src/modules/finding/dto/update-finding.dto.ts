import { IsOptional, IsEnum, IsString, IsObject, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FindingStatus, FindingSeverity } from '../../../entities/compliance-finding.entity';

export class UpdateFindingDto {
  @ApiPropertyOptional({ description: 'Updated finding status', enum: FindingStatus })
  @IsOptional()
  @IsEnum(FindingStatus)
  status?: FindingStatus;

  @ApiPropertyOptional({ description: 'Updated severity', enum: FindingSeverity })
  @IsOptional()
  @IsEnum(FindingSeverity)
  severity?: FindingSeverity;

  @ApiPropertyOptional({ description: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Updated evidence' })
  @IsOptional()
  @IsObject()
  evidence?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Updated recommendation' })
  @IsOptional()
  @IsString()
  recommendation?: string;

  @ApiPropertyOptional({ description: 'Updated affected resources' })
  @IsOptional()
  @IsArray()
  affectedResources?: Record<string, any>[];
}
