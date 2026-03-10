import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsUUID,
  IsDateString,
  MaxLength,
  MinLength,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BreachSeverity, BreachType } from '../../../entities/breach-incident.entity';

export class CreateIncidentDto {
  @ApiProperty({ description: 'Title of the breach incident', maxLength: 500 })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description of the breach' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Severity level', enum: BreachSeverity })
  @IsEnum(BreachSeverity)
  severity: BreachSeverity;

  @ApiProperty({ description: 'Type of breach', enum: BreachType })
  @IsEnum(BreachType)
  type: BreachType;

  @ApiPropertyOptional({ description: 'When the breach was detected' })
  @IsOptional()
  @IsDateString()
  detectedAt?: string;

  @ApiPropertyOptional({ description: 'When the breach was reported' })
  @IsOptional()
  @IsDateString()
  reportedAt?: string;

  @ApiPropertyOptional({ description: 'Types of data affected', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedDataTypes?: string[];

  @ApiPropertyOptional({ description: 'Systems affected by the breach', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedSystems?: string[];

  @ApiPropertyOptional({ description: 'Estimated number of affected individuals' })
  @IsOptional()
  @IsNumber()
  estimatedAffectedCount?: number;

  @ApiPropertyOptional({ description: 'Root cause of the breach' })
  @IsOptional()
  @IsString()
  rootCause?: string;

  @ApiPropertyOptional({ description: 'Impact assessment of the breach' })
  @IsOptional()
  @IsString()
  impactAssessment?: string;

  @ApiPropertyOptional({ description: 'UUID of the lead investigator' })
  @IsOptional()
  @IsUUID()
  leadInvestigatorId?: string;

  @ApiPropertyOptional({ description: 'Team member UUIDs assigned to the incident', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assignedTeam?: string[];

  @ApiPropertyOptional({ description: 'Whether regulatory report is required' })
  @IsOptional()
  @IsBoolean()
  regulatoryReportRequired?: boolean;

  @ApiPropertyOptional({ description: 'Deadline for regulatory report' })
  @IsOptional()
  @IsDateString()
  regulatoryReportDeadline?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
