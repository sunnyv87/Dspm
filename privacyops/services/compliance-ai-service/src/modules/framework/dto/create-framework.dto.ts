import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FrameworkStatus } from '../../../entities/compliance-framework.entity';

export class ControlDefinitionDto {
  @ApiProperty({ description: 'Control identifier (e.g. GDPR-7.1)' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Control name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Control description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Control category (e.g. access-control, data-protection)' })
  @IsString()
  category: string;
}

export class CreateFrameworkDto {
  @ApiProperty({ description: 'Framework name (e.g. GDPR, CCPA, HIPAA, SOC2, ISO27001, PCI_DSS)' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Framework version' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  version?: string;

  @ApiPropertyOptional({ description: 'Framework description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Framework status', enum: FrameworkStatus, default: FrameworkStatus.DRAFT })
  @IsOptional()
  @IsEnum(FrameworkStatus)
  status?: FrameworkStatus = FrameworkStatus.DRAFT;

  @ApiPropertyOptional({ description: 'Array of control definitions', type: [ControlDefinitionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ControlDefinitionDto)
  controls?: ControlDefinitionDto[];
}
