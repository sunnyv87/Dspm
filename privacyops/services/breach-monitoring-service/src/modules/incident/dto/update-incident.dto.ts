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
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  BreachSeverity,
  BreachStatus,
  BreachType,
} from '../../../entities/breach-incident.entity';

export class UpdateIncidentDto {
  @ApiPropertyOptional({ description: 'Title of the breach incident', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ description: 'Detailed description of the breach' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Severity level', enum: BreachSeverity })
  @IsOptional()
  @IsEnum(BreachSeverity)
  severity?: BreachSeverity;

  @ApiPropertyOptional({ description: 'Current status', enum: BreachStatus })
  @IsOptional()
  @IsEnum(BreachStatus)
  status?: BreachStatus;

  @ApiPropertyOptional({ description: 'Type of breach', enum: BreachType })
  @IsOptional()
  @IsEnum(BreachType)
  type?: BreachType;

  @ApiPropertyOptional({ description: 'When the breach was detected' })
  @IsOptional()
  @IsDateString()
  detectedAt?: string;

  @ApiPropertyOptional({ description: 'When the breach was reported' })
  @IsOptional()
  @IsDateString()
  reportedAt?: string;

  @ApiPropertyOptional({ description: 'When the breach was contained' })
  @IsOptional()
  @IsDateString()
  containedAt?: string;

  @ApiPropertyOptional({ description: 'When the breach was resolved' })
  @IsOptional()
  @IsDateString()
  resolvedAt?: string;

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
