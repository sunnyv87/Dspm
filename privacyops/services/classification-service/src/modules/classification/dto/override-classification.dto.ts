import { IsString, IsOptional, IsNotEmpty, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OverrideClassificationDto {
  @ApiProperty({ description: 'ID of the classification tag to override' })
  @IsUUID()
  tagId: string;

  @ApiProperty({ description: 'New classification label' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  newLabel: string;

  @ApiPropertyOptional({ description: 'Regulation tag for the new label' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  regulationTag?: string;

  @ApiPropertyOptional({ description: 'Notes explaining the override' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
