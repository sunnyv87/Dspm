import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimelineEventType } from '../../../entities/breach-timeline.entity';

export class AddTimelineEntryDto {
  @ApiProperty({ description: 'UUID of the associated breach incident' })
  @IsUUID()
  incidentId: string;

  @ApiProperty({ description: 'Type of timeline event', enum: TimelineEventType })
  @IsEnum(TimelineEventType)
  eventType: TimelineEventType;

  @ApiProperty({ description: 'Description of the event' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'UUID of the user who performed the action' })
  @IsOptional()
  @IsUUID()
  performedBy?: string;

  @ApiPropertyOptional({ description: 'Attachments metadata', type: [Object] })
  @IsOptional()
  @IsArray()
  attachments?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'When the event occurred' })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}
