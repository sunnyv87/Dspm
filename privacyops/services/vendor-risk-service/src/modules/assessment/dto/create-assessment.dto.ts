import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssessmentType } from '../../../entities/vendor-assessment.entity';
import { RiskLevel } from '../../../entities/vendor.entity';

export class CreateAssessmentDto {
  @ApiProperty({ description: 'Vendor ID to assess' })
  @IsUUID()
  vendorId: string;

  @ApiPropertyOptional({ description: 'Assessment type', enum: AssessmentType })
  @IsOptional()
  @IsEnum(AssessmentType)
  type?: AssessmentType;

  @ApiPropertyOptional({ description: 'Overall risk score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore?: number;

  @ApiPropertyOptional({ description: 'Risk level', enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiPropertyOptional({ description: 'Assessment findings', type: [Object] })
  @IsOptional()
  @IsArray()
  findings?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Recommendations', type: [Object] })
  @IsOptional()
  @IsArray()
  recommendations?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Due date for the assessment' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
