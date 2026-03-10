import { IsString, IsEnum, IsOptional, IsObject, IsArray, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DataSourceType, CredentialType } from '../../../entities/data-source.entity';

export class CreateDataSourceDto {
  @ApiProperty({ description: 'Data source name', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Data source type', enum: DataSourceType })
  @IsEnum(DataSourceType)
  type: DataSourceType;

  @ApiProperty({ description: 'Connection configuration (encrypted at rest)' })
  @IsObject()
  connectionConfig: Record<string, any>;

  @ApiProperty({ description: 'Credential type used for connection', enum: CredentialType })
  @IsEnum(CredentialType)
  credentialType: CredentialType;

  @ApiPropertyOptional({ description: 'Owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerUserId?: string;

  @ApiPropertyOptional({ description: 'Business unit', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  businessUnit?: string;

  @ApiPropertyOptional({ description: 'Description of the data source' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
