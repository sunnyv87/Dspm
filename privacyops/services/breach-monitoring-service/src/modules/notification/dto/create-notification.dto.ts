import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RecipientType,
  NotificationChannel,
} from '../../../entities/breach-notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'UUID of the associated breach incident' })
  @IsUUID()
  incidentId: string;

  @ApiProperty({ description: 'Type of recipient', enum: RecipientType })
  @IsEnum(RecipientType)
  recipientType: RecipientType;

  @ApiProperty({ description: 'Name of the recipient', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  recipientName: string;

  @ApiPropertyOptional({ description: 'Email of the recipient' })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @ApiPropertyOptional({ description: 'Template name for the notification' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  templateName?: string;

  @ApiPropertyOptional({ description: 'Content of the notification' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Notification channel', enum: NotificationChannel })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;
}
