import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TriggerExecutionDto {
  @ApiProperty({ description: 'ID of the retention policy to execute' })
  @IsUUID()
  policyId: string;

  @ApiPropertyOptional({ description: 'ID of the schedule triggering this execution' })
  @IsOptional()
  @IsUUID()
  scheduleId?: string;
}
