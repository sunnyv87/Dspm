import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePolicyDto {
  @ApiProperty({ description: 'Purpose ID this policy belongs to' })
  @IsUUID()
  purposeId: string;

  @ApiPropertyOptional({ description: 'Language code', default: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiProperty({ description: 'Policy title', maxLength: 500 })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiProperty({ description: 'Policy content in markdown format' })
  @IsString()
  @MinLength(1)
  contentMarkdown: string;

  @ApiPropertyOptional({ description: 'Policy content in HTML format' })
  @IsOptional()
  @IsString()
  contentHtml?: string;

  @ApiProperty({ description: 'Effective from date (ISO 8601)' })
  @IsDateString()
  effectiveFrom: string;

  @ApiPropertyOptional({ description: 'Effective to date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Whether this policy version is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
