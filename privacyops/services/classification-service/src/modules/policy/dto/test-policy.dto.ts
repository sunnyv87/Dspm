import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TestPolicyDto {
  @ApiProperty({ description: 'Sample asset name to test against' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Sample asset path to test against' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: 'Sample column names to test against' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columnNames?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata to test against' })
  @IsOptional()
  metadata?: Record<string, any>;
}
