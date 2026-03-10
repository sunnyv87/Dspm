import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsInt, Min, IsBoolean, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  LawfulBasis,
  ProcessingActivityStatus,
} from '../../../entities/processing-activity.entity';

export class QueryProcessingActivityDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ enum: ProcessingActivityStatus })
  @IsEnum(ProcessingActivityStatus)
  @IsOptional()
  status?: ProcessingActivityStatus;

  @ApiPropertyOptional({ enum: LawfulBasis })
  @IsEnum(LawfulBasis)
  @IsOptional()
  lawfulBasis?: LawfulBasis;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  crossBorderTransfer?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  search?: string;
}
