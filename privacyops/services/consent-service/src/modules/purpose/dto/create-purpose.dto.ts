import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LegalBasis } from '../../../entities/consent-purpose.entity';

export class CreatePurposeDto {
  @ApiProperty({ description: 'Name of the consent purpose', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Description of the consent purpose' })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiProperty({ description: 'Legal basis for processing', enum: LegalBasis })
  @IsEnum(LegalBasis)
  legalBasis: LegalBasis;

  @ApiPropertyOptional({ description: 'Data categories being processed', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataCategories?: string[];

  @ApiPropertyOptional({ description: 'Retention period in days' })
  @IsOptional()
  @IsNumber()
  retentionPeriodDays?: number;

  @ApiPropertyOptional({ description: 'Whether this consent is mandatory', default: false })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiPropertyOptional({ description: 'Regulatory frameworks (e.g., GDPR, CCPA)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regulatoryFrameworks?: string[];

  @ApiPropertyOptional({ description: 'Third party data recipients', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thirdPartyRecipients?: string[];

  @ApiPropertyOptional({ description: 'Cross-border transfer details', type: [Object] })
  @IsOptional()
  @IsArray()
  crossBorderTransfers?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Related processing activity IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  processingActivityIds?: string[];
}
