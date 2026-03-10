import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class ReviewActionDto {
  @ApiPropertyOptional({ description: 'Notes about the review decision' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class ReviewOverrideDto {
  @ApiProperty({ description: 'New label to apply instead' })
  @IsString()
  @MaxLength(255)
  newLabel: string;

  @ApiPropertyOptional({ description: 'Regulation tag for the new label' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  regulationTag?: string;

  @ApiPropertyOptional({ description: 'Notes about the override decision' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
