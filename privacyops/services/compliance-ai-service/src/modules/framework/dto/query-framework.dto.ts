import { IsOptional, IsString, IsEnum, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FrameworkStatus } from '../../../entities/compliance-framework.entity';

export class QueryFrameworkDto {
  @ApiPropertyOptional({ description: 'Search by name or description' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by framework status', enum: FrameworkStatus })
  @IsOptional()
  @IsEnum(FrameworkStatus)
  status?: FrameworkStatus;

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
