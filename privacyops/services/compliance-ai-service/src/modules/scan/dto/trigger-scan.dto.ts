import { IsUUID, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScanType } from '../../../entities/compliance-scan.entity';

export class TriggerScanDto {
  @ApiProperty({ description: 'Framework ID to scan against' })
  @IsUUID()
  frameworkId: string;

  @ApiPropertyOptional({ description: 'Scan type', enum: ScanType, default: ScanType.FULL })
  @IsOptional()
  @IsEnum(ScanType)
  type?: ScanType = ScanType.FULL;

  @ApiPropertyOptional({ description: 'Scope of the scan (list of areas to scan)' })
  @IsOptional()
  @IsObject()
  scope?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Additional metadata for the scan' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
