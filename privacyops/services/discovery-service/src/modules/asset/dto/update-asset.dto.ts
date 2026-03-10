import { IsString, IsOptional, IsArray, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssetDto {
  @ApiPropertyOptional({ description: 'Owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerUserId?: string;

  @ApiPropertyOptional({ description: 'Business owner name', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  businessOwner?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Classifications', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  classifications?: string[];
}
