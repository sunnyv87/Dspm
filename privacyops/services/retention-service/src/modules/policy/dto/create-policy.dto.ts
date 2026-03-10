import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RetentionAction, RetentionPolicyStatus } from '../../../entities/retention-policy.entity';

export class CreatePolicyDto {
  @ApiProperty({ description: 'Name of the retention policy', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Description of the retention policy' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Data category this policy applies to' })
  @IsString()
  @MaxLength(255)
  dataCategory: string;

  @ApiProperty({ description: 'Retention period in days' })
  @IsNumber()
  @Min(1)
  retentionPeriodDays: number;

  @ApiProperty({ description: 'Action to take when retention period expires', enum: RetentionAction })
  @IsEnum(RetentionAction)
  action: RetentionAction;

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
