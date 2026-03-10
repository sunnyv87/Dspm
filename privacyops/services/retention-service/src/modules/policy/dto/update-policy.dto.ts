import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RetentionAction, RetentionPolicyStatus } from '../../../entities/retention-policy.entity';

export class UpdatePolicyDto {
  @ApiPropertyOptional({ description: 'Name of the retention policy' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the retention policy' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Data category this policy applies to' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  dataCategory?: string;

  @ApiPropertyOptional({ description: 'Retention period in days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  retentionPeriodDays?: number;

  @ApiPropertyOptional({ description: 'Action to take when retention period expires', enum: RetentionAction })
  @IsOptional()
  @IsEnum(RetentionAction)
  action?: RetentionAction;

  @ApiPropertyOptional({ description: 'Policy status', enum: RetentionPolicyStatus })
  @IsOptional()
  @IsEnum(RetentionPolicyStatus)
  status?: RetentionPolicyStatus;

  @ApiPropertyOptional({ description: 'Legal basis for the retention policy' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalBasis?: string;

  @ApiPropertyOptional({ description: 'Regulatory framework (e.g., GDPR, CCPA)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  regulatoryFramework?: string;
}
