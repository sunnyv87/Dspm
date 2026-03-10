import { IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportFormat } from '../../../entities/report-definition.entity';

export class GenerateReportDto {
  @ApiPropertyOptional({ description: 'Override output format', enum: ReportFormat })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiPropertyOptional({ description: 'Additional parameters for report generation' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}
