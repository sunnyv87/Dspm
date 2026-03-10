import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  MaxLength,
  Min,
  ValidateNested,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PolicyRuleDto {
  @ApiProperty({ description: 'Pattern to match (regex string or comma-separated keywords)' })
  @IsString()
  @IsNotEmpty()
  pattern: string;

  @ApiProperty({ description: 'Type of rule', enum: ['regex', 'keyword', 'ai'] })
  @IsEnum(['regex', 'keyword', 'ai'])
  type: 'regex' | 'keyword' | 'ai';

  @ApiProperty({ description: 'Classification label to apply' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: 'Regulation tag (e.g., DPDP, GDPR, PCI, HIPAA)' })
  @IsString()
  @IsNotEmpty()
  regulationTag: string;

  @ApiPropertyOptional({ description: 'Confidence score for the rule (0-1)', default: 0.8 })
  @IsOptional()
  @IsNumber()
  confidence: number;
}

export class CreatePolicyDto {
  @ApiProperty({ description: 'Policy name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Policy description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Classification rules', type: [PolicyRuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolicyRuleDto)
  rulesJson: PolicyRuleDto[];

  @ApiPropertyOptional({ description: 'Default label for unmatched assets', default: 'unclassified' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  defaultLabel?: string;

  @ApiPropertyOptional({ description: 'Whether the policy is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Priority (higher = evaluated first)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}
