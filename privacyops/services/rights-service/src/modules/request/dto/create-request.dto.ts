import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestType, RequestPriority } from '../../../entities/rights-request.entity';

export class CreateRequestDto {
  @ApiProperty({ description: 'ID of the data subject making the request' })
  @IsUUID()
  subjectId: string;

  @ApiProperty({ description: 'Type of rights request', enum: RequestType })
  @IsEnum(RequestType)
  type: RequestType;

  @ApiPropertyOptional({ description: 'Priority of the request', enum: RequestPriority })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @ApiPropertyOptional({ description: 'Description of the request' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Due date for completing the request' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'User ID to assign the request to' })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Method used to verify the subject identity' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  verificationMethod?: string;

  @ApiPropertyOptional({ description: 'Regulatory framework (e.g., GDPR, CCPA)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  regulatoryFramework?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
