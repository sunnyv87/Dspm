import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsArray,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduledReportStatus } from '../../../entities/scheduled-report.entity';

export class CreateScheduleDto {
  @ApiProperty({ description: 'ID of the report definition to schedule' })
  @IsUUID()
  definitionId: string;

  @ApiProperty({ description: 'Name of the scheduled report', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Cron expression for scheduling (e.g., "0 8 * * 1")' })
  @IsString()
  @MaxLength(100)
  cronExpression: string;

  @ApiPropertyOptional({ description: 'Email recipients for the report', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];

  @ApiPropertyOptional({ description: 'Schedule status', enum: ScheduledReportStatus })
  @IsOptional()
  @IsEnum(ScheduledReportStatus)
  status?: ScheduledReportStatus;
}
