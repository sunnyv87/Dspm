import { IsOptional, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ApprovalDecision } from '../../../entities/approval-record.entity';

export class QueryApprovalDto {
  @ApiPropertyOptional({ description: 'Filter by task ID' })
  @IsOptional()
  @IsUUID()
  taskId?: string;

  @ApiPropertyOptional({ description: 'Filter by instance ID' })
  @IsOptional()
  @IsUUID()
  instanceId?: string;

  @ApiPropertyOptional({ description: 'Filter by approver user ID' })
  @IsOptional()
  @IsUUID()
  approverId?: string;

  @ApiPropertyOptional({ description: 'Filter by decision', enum: ApprovalDecision })
  @IsOptional()
  @IsEnum(ApprovalDecision)
  decision?: ApprovalDecision;

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
