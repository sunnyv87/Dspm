import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FindingSeverity } from '../../../entities/risk-finding.entity';

export class CreateFindingDto {
  @ApiProperty({ description: 'Vendor ID' })
  @IsUUID()
  vendorId: string;

  @ApiPropertyOptional({ description: 'Assessment ID to link to' })
  @IsOptional()
  @IsUUID()
  assessmentId?: string;

  @ApiProperty({ description: 'Finding title', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description of the finding' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Finding category', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  category?: string;

  @ApiPropertyOptional({ description: 'Severity level', enum: FindingSeverity })
  @IsOptional()
  @IsEnum(FindingSeverity)
  severity?: FindingSeverity;

  @ApiPropertyOptional({ description: 'Remediation plan' })
  @IsOptional()
  @IsString()
  remediationPlan?: string;

  @ApiPropertyOptional({ description: 'Due date for remediation' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
