import { IsOptional, IsString, IsEnum, IsUUID, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ScheduledReportStatus } from '../../../entities/scheduled-report.entity';

export class QueryScheduleDto {
  @ApiPropertyOptional({ description: 'Filter by report definition ID' })
  @IsOptional()
  @IsUUID()
  definitionId?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ScheduledReportStatus })
  @IsOptional()
  @IsEnum(ScheduledReportStatus)
  status?: ScheduledReportStatus;

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
