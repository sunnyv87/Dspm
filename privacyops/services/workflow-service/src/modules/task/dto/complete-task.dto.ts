import { IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteTaskDto {
  @ApiPropertyOptional({ description: 'Task output data' })
  @IsOptional()
  @IsObject()
  output?: Record<string, any>;
}
