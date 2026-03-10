import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateProcessingActivityDto } from './create-processing-activity.dto';
import { ProcessingActivityStatus } from '../../../entities/processing-activity.entity';

export class UpdateProcessingActivityDto extends PartialType(
  CreateProcessingActivityDto,
) {
  @ApiPropertyOptional({ enum: ProcessingActivityStatus })
  @IsEnum(ProcessingActivityStatus)
  @IsOptional()
  status?: ProcessingActivityStatus;
}
