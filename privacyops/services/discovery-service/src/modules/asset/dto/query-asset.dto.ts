import { IsEnum, IsOptional, IsUUID, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AssetType, SensitivityLevel } from '../../../entities/data-asset.entity';

export class QueryAssetDto {
  @ApiPropertyOptional({ description: 'Filter by data source ID' })
  @IsOptional()
  @IsUUID()
  dataSourceId?: string;

  @ApiPropertyOptional({ description: 'Filter by asset type', enum: AssetType })
  @IsOptional()
  @IsEnum(AssetType)
  assetType?: AssetType;

  @ApiPropertyOptional({ description: 'Filter by sensitivity level', enum: SensitivityLevel })
  @IsOptional()
  @IsEnum(SensitivityLevel)
  sensitivityLevel?: SensitivityLevel;

  @ApiPropertyOptional({ description: 'Filter by personal data presence' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  containsPersonalData?: boolean;

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
