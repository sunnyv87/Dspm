import { IsOptional, IsEnum, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ReportExecutionStatus } from '../../../entities/report-execution.entity';

export class QueryExecutionDto {
  @ApiPropertyOptional({ description: 'Filter by report definition ID' })
  @IsOptional()
  @IsUUID()
  definitionId?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ReportExecutionStatus })
  @IsOptional()
  @IsEnum(ReportExecutionStatus)
  status?: ReportExecutionStatus;

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
