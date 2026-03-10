import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiTokenDto {
  @ApiProperty({ example: 'CI/CD Pipeline Token' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: ['consent:read', 'data-map:read'],
    description: 'Array of scopes/permissions for this token',
  })
  @IsArray()
  @IsString({ each: true })
  @Matches(/^[a-z\-]+:[a-z]+$/, {
    each: true,
    message: 'Each scope must follow "module:action" format',
  })
  scopes: string[];

  @ApiProperty({
    example: '2025-12-31T23:59:59.000Z',
    required: false,
    description: 'Token expiration date (defaults to 1 year)',
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
