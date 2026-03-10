import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DataSourceType, DataSourceStatus } from '../../../entities/data-source.entity';

export class QueryDataSourceDto {
  @ApiPropertyOptional({ description: 'Filter by data source type', enum: DataSourceType })
  @IsOptional()
  @IsEnum(DataSourceType)
  type?: DataSourceType;

  @ApiPropertyOptional({ description: 'Filter by status', enum: DataSourceStatus })
  @IsOptional()
  @IsEnum(DataSourceStatus)
  status?: DataSourceStatus;

  @ApiPropertyOptional({ description: 'Filter by business unit' })
  @IsOptional()
  @IsString()
  businessUnit?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
