import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsDateString,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SubjectType,
  RiskLevel,
} from '../../../entities/affected-data-subject.entity';

export class RegisterAffectedDto {
  @ApiProperty({ description: 'UUID of the associated breach incident' })
  @IsUUID()
  incidentId: string;

  @ApiProperty({ description: 'Identifier for the data subject (email, ID, etc.)', maxLength: 500 })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  subjectIdentifier: string;

  @ApiProperty({ description: 'Type of data subject', enum: SubjectType })
  @IsEnum(SubjectType)
  subjectType: SubjectType;

  @ApiPropertyOptional({ description: 'Categories of affected data', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedDataCategories?: string[];

  @ApiProperty({ description: 'Risk level for the data subject', enum: RiskLevel })
  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;

  @ApiPropertyOptional({ description: 'Whether the subject has been notified' })
  @IsOptional()
  @IsBoolean()
  notified?: boolean;

  @ApiPropertyOptional({ description: 'When the subject was notified' })
  @IsOptional()
  @IsDateString()
  notifiedAt?: string;
}
