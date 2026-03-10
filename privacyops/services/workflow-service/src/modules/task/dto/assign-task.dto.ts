import { IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AssignTaskDto {
  @ApiPropertyOptional({ description: 'User ID to assign the task to' })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Group to assign the task to' })
  @IsOptional()
  @IsString()
  assignedGroup?: string;
}
