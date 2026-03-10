import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() tenantSlug?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() mfaCode?: string;
}
