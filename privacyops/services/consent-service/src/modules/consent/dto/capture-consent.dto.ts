import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CollectionMethod } from '../../../entities/consent-record.entity';

export class CaptureConsentDto {
  @ApiProperty({ description: 'Unique identifier for the data subject' })
  @IsString()
  @MaxLength(500)
  dataSubjectId: string;

  @ApiPropertyOptional({ description: 'Email of the data subject' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  dataSubjectEmail?: string;

  @ApiPropertyOptional({ description: 'External ID for the data subject' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  dataSubjectExternalId?: string;

  @ApiProperty({ description: 'Consent purpose ID' })
  @IsUUID()
  purposeId: string;

  @ApiProperty({ description: 'Policy version ID' })
  @IsUUID()
  policyVersionId: string;

  @ApiProperty({ description: 'How consent was collected', enum: CollectionMethod })
  @IsEnum(CollectionMethod)
  collectionMethod: CollectionMethod;

  @ApiPropertyOptional({ description: 'Additional context about consent collection' })
  @IsOptional()
  collectionContext?: Record<string, any>;

  @ApiPropertyOptional({ description: 'IP address of the data subject' })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent of the data subject' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Device information' })
  @IsOptional()
  deviceInfo?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Granular consent choices' })
  @IsOptional()
  granularity?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Source of consent' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @ApiPropertyOptional({ description: 'Whether the data subject is a minor', default: false })
  @IsOptional()
  @IsBoolean()
  isMinor?: boolean;

  @ApiPropertyOptional({ description: 'Guardian consent record ID (for minors)' })
  @IsOptional()
  @IsUUID()
  guardianConsentId?: string;

  @ApiPropertyOptional({ description: 'Consent expiration date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ description: 'Tenant ID' })
  @IsUUID()
  tenantId: string;
}
