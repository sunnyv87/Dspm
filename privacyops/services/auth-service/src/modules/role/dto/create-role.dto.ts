import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ArrayNotEmpty,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'data_steward' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Data Steward responsible for data quality', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: ['consent:read', 'consent:write', 'data-map:read'],
    description: 'Array of permissions in "module:action" format',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^[a-z\-]+:[a-z]+$/, {
    each: true,
    message: 'Each permission must follow "module:action" format (e.g., "consent:read")',
  })
  permissions: string[];
}

export class UpdateRoleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Matches(/^[a-z\-]+:[a-z]+$/, {
    each: true,
    message: 'Each permission must follow "module:action" format',
  })
  permissions?: string[];
}
