import { IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BulkApplyDto {
  @ApiPropertyOptional({ description: 'Data source ID to classify all assets from' })
  @IsOptional()
  @IsUUID()
  dataSourceId?: string;

  @ApiPropertyOptional({ description: 'Specific policy ID to use' })
  @IsOptional()
  @IsUUID()
  policyId?: string;

  @ApiPropertyOptional({ description: 'Specific asset IDs to classify' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assetIds?: string[];
}
