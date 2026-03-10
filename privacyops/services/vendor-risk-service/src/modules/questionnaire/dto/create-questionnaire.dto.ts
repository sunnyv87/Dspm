import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionnaireDto {
  @ApiProperty({ description: 'Vendor ID' })
  @IsUUID()
  vendorId: string;

  @ApiPropertyOptional({ description: 'Assessment ID to link to' })
  @IsOptional()
  @IsUUID()
  assessmentId?: string;

  @ApiProperty({ description: 'Template name', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  templateName: string;

  @ApiPropertyOptional({ description: 'Template version', default: '1.0' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  version?: string;

  @ApiPropertyOptional({ description: 'Questions to include', type: [Object] })
  @IsOptional()
  @IsArray()
  questions?: Record<string, any>[];
}
