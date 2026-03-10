import { IsEnum, IsOptional, IsUUID, IsObject, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RelationshipType } from '../../../entities/asset-lineage.entity';

export class CreateLineageDto {
  @ApiProperty({ description: 'Source asset ID' })
  @IsUUID()
  sourceAssetId: string;

  @ApiProperty({ description: 'Target asset ID' })
  @IsUUID()
  targetAssetId: string;

  @ApiProperty({ description: 'Relationship type', enum: RelationshipType })
  @IsEnum(RelationshipType)
  relationshipType: RelationshipType;

  @ApiPropertyOptional({ description: 'Additional metadata about the relationship' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'When the relationship was discovered' })
  @IsOptional()
  @IsDateString()
  discoveredAt?: string;
}
