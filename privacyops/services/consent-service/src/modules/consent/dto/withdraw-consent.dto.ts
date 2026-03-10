import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WithdrawConsentDto {
  @ApiProperty({ description: 'Consent record ID to withdraw' })
  @IsUUID()
  consentRecordId: string;

  @ApiProperty({ description: 'Tenant ID' })
  @IsUUID()
  tenantId: string;

  @ApiPropertyOptional({ description: 'Reason for withdrawal' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;

  @ApiPropertyOptional({ description: 'IP address of the requestor' })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent of the requestor' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
