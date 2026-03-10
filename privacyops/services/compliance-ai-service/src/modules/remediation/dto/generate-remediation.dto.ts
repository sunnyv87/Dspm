import {
  IsUUID,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RemediationPriority, RemediationStatus } from '../../../entities/remediation-suggestion.entity';

export class GenerateRemediationDto {
  @ApiProperty({ description: 'Finding ID to generate remediation for' })
  @IsUUID()
  findingId: string;

  @ApiProperty({ description: 'Scan ID associated with the finding' })
  @IsUUID()
  scanId: string;

  @ApiPropertyOptional({ description: 'Remediation title' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ description: 'Remediation description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Priority level', enum: RemediationPriority })
  @IsOptional()
  @IsEnum(RemediationPriority)
  priority?: RemediationPriority;

  @ApiPropertyOptional({ description: 'Estimated effort (e.g. "2 hours", "1 week")' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  estimatedEffort?: string;

  @ApiPropertyOptional({ description: 'User ID to assign remediation to' })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Remediation steps' })
  @IsOptional()
  @IsArray()
  steps?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Reference resources' })
  @IsOptional()
  @IsArray()
  resources?: Record<string, any>[];
}

export class UpdateRemediationStatusDto {
  @ApiProperty({ description: 'New remediation status', enum: RemediationStatus })
  @IsEnum(RemediationStatus)
  status: RemediationStatus;

  @ApiPropertyOptional({ description: 'User ID to assign to' })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
