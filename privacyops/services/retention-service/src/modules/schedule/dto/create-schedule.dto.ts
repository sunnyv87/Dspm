import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleStatus } from '../../../entities/retention-schedule.entity';

export class CreateScheduleDto {
  @ApiProperty({ description: 'ID of the retention policy to schedule' })
  @IsUUID()
  policyId: string;

  @ApiProperty({ description: 'Name of the schedule', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Cron expression for scheduling (e.g., "0 2 * * *")' })
  @IsString()
  @MaxLength(100)
  cronExpression: string;

  @ApiPropertyOptional({ description: 'Schedule status', enum: ScheduleStatus })
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}
