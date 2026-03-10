import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { AuditEntry } from './entities/audit-entry.entity';
import { AuditRetentionPolicy } from './entities/audit-retention.entity';
import { AuditModule } from './modules/audit/audit.module';
import { OpenSearchModule } from './modules/opensearch/opensearch.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [AuditEntry, AuditRetentionPolicy],
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        ssl: configService.get<boolean>('database.ssl')
          ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
          : false,
        extra: {
          max: configService.get<number>('database.maxConnections'),
        },
      }),
    }),

    AuditModule,
    OpenSearchModule,
    IngestionModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
