import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationPreferenceEntity } from './entities/notification-preference.entity';
import { NotificationTemplateEntity } from './entities/notification-template.entity';
import { NotificationModule } from './modules/notification/notification.module';
import { ChannelModule } from './modules/channel/channel.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        type: 'postgres',
        host: cs.get('database.host'),
        port: cs.get('database.port'),
        username: cs.get('database.username'),
        password: cs.get('database.password'),
        database: cs.get('database.database'),
        entities: [NotificationEntity, NotificationPreferenceEntity, NotificationTemplateEntity],
        synchronize: cs.get('database.synchronize'),
        logging: cs.get('database.logging'),
      }),
    }),
    NotificationModule,
    ChannelModule,
    IngestionModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
