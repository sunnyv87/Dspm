import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType, ReportFormat, ReportDefinitionStatus } from '../../../entities/report-definition.entity';

export class CreateReportDto {
  @ApiProperty({ description: 'Name of the report definition', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Description of the report' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Type of report', enum: ReportType })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiPropertyOptional({ description: 'Output format', enum: ReportFormat })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiPropertyOptional({ description: 'Report template configuration' })
  @IsOptional()
  @IsObject()
  template?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Data sources for the report', type: [Object] })
  @IsOptional()
  @IsArray()
  dataSources?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Filters for the report data' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Report status', enum: ReportDefinitionStatus })
  @IsOptional()
  @IsEnum(ReportDefinitionStatus)
  status?: ReportDefinitionStatus;
}
