import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SyncType } from '../../../entities/sync-job.entity';

export class TriggerSyncDto {
  @ApiProperty({ description: 'Data source ID to sync' })
  @IsUUID()
  dataSourceId: string;

  @ApiPropertyOptional({ description: 'Sync type', enum: SyncType, default: SyncType.FULL })
  @IsOptional()
  @IsEnum(SyncType)
  syncType?: SyncType = SyncType.FULL;
}
