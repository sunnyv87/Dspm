import {
  IsString,
  IsUrl,
  IsArray,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WebhookEventType {
  CONSENT_GRANTED = 'consent.granted',
  CONSENT_WITHDRAWN = 'consent.withdrawn',
  CONSENT_EXPIRED = 'consent.expired',
}

export class CreateWebhookDto {
  @ApiProperty({ description: 'Webhook name', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Webhook URL', maxLength: 2000 })
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  url: string;

  @ApiProperty({ description: 'Webhook secret for signing payloads', maxLength: 500 })
  @IsString()
  @MinLength(8)
  @MaxLength(500)
  secret: string;

  @ApiProperty({
    description: 'Event types to subscribe to',
    enum: WebhookEventType,
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  events: string[];

  @ApiPropertyOptional({ description: 'Whether the webhook is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWebhookDto {
  @ApiPropertyOptional({ description: 'Webhook name', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Webhook URL', maxLength: 2000 })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  url?: string;

  @ApiPropertyOptional({ description: 'Webhook secret', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(500)
  secret?: string;

  @ApiPropertyOptional({
    description: 'Event types to subscribe to',
    enum: WebhookEventType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  events?: string[];

  @ApiPropertyOptional({ description: 'Whether the webhook is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
