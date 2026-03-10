import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsDateString,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VendorCategory, RiskLevel, VendorStatus } from '../../../entities/vendor.entity';

export class UpdateVendorDto {
  @ApiPropertyOptional({ description: 'Name of the vendor', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the vendor' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Vendor website URL', maxLength: 512 })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  website?: string;

  @ApiPropertyOptional({ description: 'Contact email address' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Contact person name', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactName?: string;

  @ApiPropertyOptional({ description: 'Vendor category', enum: VendorCategory })
  @IsOptional()
  @IsEnum(VendorCategory)
  category?: VendorCategory;

  @ApiPropertyOptional({ description: 'Risk level', enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiPropertyOptional({ description: 'Vendor status', enum: VendorStatus })
  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @ApiPropertyOptional({ description: 'Whether a DPA is in place' })
  @IsOptional()
  @IsBoolean()
  dataProcessingAgreement?: boolean;

  @ApiPropertyOptional({ description: 'Next assessment due date' })
  @IsOptional()
  @IsDateString()
  nextAssessmentDate?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
