import {
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitResponseDto {
  @ApiProperty({ description: 'Questionnaire responses', type: [Object] })
  @IsArray()
  responses: Record<string, any>[];
}
