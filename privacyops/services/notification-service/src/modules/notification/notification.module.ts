import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TemplateService } from './template.service';
import { NotificationEntity } from '../../entities/notification.entity';
import { NotificationPreferenceEntity } from '../../entities/notification-preference.entity';
import { NotificationTemplateEntity } from '../../entities/notification-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity, NotificationPreferenceEntity, NotificationTemplateEntity])],
  controllers: [NotificationController],
  providers: [NotificationService, TemplateService],
  exports: [NotificationService],
})
export class NotificationModule {}
