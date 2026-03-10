import { IsString, IsEnum, IsOptional, IsObject, IsArray, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DataSourceType, DataSourceStatus, CredentialType } from '../../../entities/data-source.entity';

export class UpdateDataSourceDto {
  @ApiPropertyOptional({ description: 'Data source name', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Data source type', enum: DataSourceType })
  @IsOptional()
  @IsEnum(DataSourceType)
  type?: DataSourceType;

  @ApiPropertyOptional({ description: 'Data source status', enum: DataSourceStatus })
  @IsOptional()
  @IsEnum(DataSourceStatus)
  status?: DataSourceStatus;

  @ApiPropertyOptional({ description: 'Connection configuration' })
  @IsOptional()
  @IsObject()
  connectionConfig?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Credential type', enum: CredentialType })
  @IsOptional()
  @IsEnum(CredentialType)
  credentialType?: CredentialType;

  @ApiPropertyOptional({ description: 'Owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerUserId?: string;

  @ApiPropertyOptional({ description: 'Business unit', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  businessUnit?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
