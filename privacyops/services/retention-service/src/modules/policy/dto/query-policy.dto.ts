import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RetentionAction, RetentionPolicyStatus } from '../../../entities/retention-policy.entity';

export class QueryPolicyDto {
  @ApiPropertyOptional({ description: 'Search by name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: RetentionPolicyStatus })
  @IsOptional()
  @IsEnum(RetentionPolicyStatus)
  status?: RetentionPolicyStatus;

  @ApiPropertyOptional({ description: 'Filter by action', enum: RetentionAction })
  @IsOptional()
  @IsEnum(RetentionAction)
  action?: RetentionAction;

  @ApiPropertyOptional({ description: 'Filter by data category' })
  @IsOptional()
  @IsString()
  dataCategory?: string;

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
