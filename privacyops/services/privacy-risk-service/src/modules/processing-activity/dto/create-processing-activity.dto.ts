import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { LawfulBasis } from '../../../entities/processing-activity.entity';

export class CreateProcessingActivityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  department?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({ enum: LawfulBasis })
  @IsEnum(LawfulBasis)
  lawfulBasis: LawfulBasis;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  dataCategories: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dataSubjectCategories?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  systems?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  thirdParties?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  crossBorderTransfer?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  crossBorderDetails?: Record<string, any>;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  automatedDecisionMaking?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  retentionPeriodDays?: number;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  ownerUserId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  dpiaRequired?: boolean;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  dpiaId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  consentPurposeIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dataSourceIds?: string[];
}
