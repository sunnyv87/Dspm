import { IsOptional, IsString, IsEnum, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ScanStatus, ScanType } from '../../../entities/compliance-scan.entity';

export class QueryScanDto {
  @ApiPropertyOptional({ description: 'Filter by framework ID' })
  @IsOptional()
  @IsUUID()
  frameworkId?: string;

  @ApiPropertyOptional({ description: 'Filter by scan status', enum: ScanStatus })
  @IsOptional()
  @IsEnum(ScanStatus)
  status?: ScanStatus;

  @ApiPropertyOptional({ description: 'Filter by scan type', enum: ScanType })
  @IsOptional()
  @IsEnum(ScanType)
  type?: ScanType;

  @ApiPropertyOptional({ description: 'Search by metadata or scope' })
  @IsOptional()
  @IsString()
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
