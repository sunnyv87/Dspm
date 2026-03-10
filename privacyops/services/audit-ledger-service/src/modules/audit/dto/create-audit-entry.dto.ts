import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsString,
  IsObject,
  IsIP,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AuditAction,
  AuditSeverity,
  AuditChanges,
} from '../../../entities/audit-entry.entity';

export class CreateAuditEntryDto {
  @ApiProperty({ description: 'Tenant ID' })
  @IsNotEmpty()
  @IsUUID()
  tenantId: string;

  @ApiPropertyOptional({ description: 'User ID (null for system events)' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'User email address' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  userEmail?: string;

  @ApiProperty({ description: 'Action performed', enum: AuditAction })
  @IsNotEmpty()
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({ description: 'Entity type (e.g. consent, user, breach)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  entityType: string;

  @ApiPropertyOptional({ description: 'Entity ID' })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Changes made (before/after)' })
  @IsOptional()
  @IsObject()
  changes?: AuditChanges;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Client IP address' })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Client user agent string' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Severity level', enum: AuditSeverity, default: AuditSeverity.INFO })
  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;
}
