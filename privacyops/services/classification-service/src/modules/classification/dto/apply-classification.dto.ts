import { IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyClassificationDto {
  @ApiPropertyOptional({ description: 'Specific policy ID to use for classification' })
  @IsOptional()
  @IsUUID()
  policyId?: string;

  @ApiPropertyOptional({ description: 'Force re-classification even if tags already exist' })
  @IsOptional()
  force?: boolean;
}
