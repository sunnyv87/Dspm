import { IsOptional, IsString, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  InstanceStatus,
  InstancePriority,
} from '../../../entities/workflow-instance.entity';

export class QueryInstanceDto {
  @ApiPropertyOptional({ description: 'Filter by definition ID' })
  @IsOptional()
  @IsUUID()
  definitionId?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: InstanceStatus })
  @IsOptional()
  @IsEnum(InstanceStatus)
  status?: InstanceStatus;

  @ApiPropertyOptional({ description: 'Filter by priority', enum: InstancePriority })
  @IsOptional()
  @IsEnum(InstancePriority)
  priority?: InstancePriority;

  @ApiPropertyOptional({ description: 'Filter by initiator user ID' })
  @IsOptional()
  @IsUUID()
  initiatedBy?: string;

  @ApiPropertyOptional({ description: 'Filter by parent instance ID' })
  @IsOptional()
  @IsUUID()
  parentInstanceId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
