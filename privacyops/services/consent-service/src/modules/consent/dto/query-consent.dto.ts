import { IsOptional, IsUUID, IsEnum, IsString, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ConsentStatus, CollectionMethod } from '../../../entities/consent-record.entity';

export class QueryConsentDto {
  @ApiPropertyOptional({ description: 'Filter by data subject ID' })
  @IsOptional()
  @IsString()
  dataSubjectId?: string;

  @ApiPropertyOptional({ description: 'Filter by consent status', enum: ConsentStatus })
  @IsOptional()
  @IsEnum(ConsentStatus)
  status?: ConsentStatus;

  @ApiPropertyOptional({ description: 'Filter by purpose ID' })
  @IsOptional()
  @IsUUID()
  purposeId?: string;

  @ApiPropertyOptional({ description: 'Filter by collection method', enum: CollectionMethod })
  @IsOptional()
  @IsEnum(CollectionMethod)
  collectionMethod?: CollectionMethod;

  @ApiPropertyOptional({ description: 'Filter by date range start (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by date range end (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

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
