import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { DataSource } from './entities/data-source.entity';
import { DataAsset } from './entities/data-asset.entity';
import { SyncJob } from './entities/sync-job.entity';
import { AssetLineage } from './entities/asset-lineage.entity';
import { HealthModule } from './modules/health/health.module';
import { DataSourceModule } from './modules/data-source/data-source.module';
import { AssetModule } from './modules/asset/asset.module';
import { SyncModule } from './modules/sync/sync.module';
import { LineageModule } from './modules/lineage/lineage.module';
import { DspmClientModule } from './modules/dspm-client/dspm-client.module';
import { KafkaModule } from './common/kafka/kafka.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RbacGuard } from './common/guards/rbac.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        ssl: configService.get<boolean>('database.ssl')
          ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
          : false,
        entities: [DataSource, DataAsset, SyncJob, AssetLineage],
        synchronize: false,
        logging: configService.get<string>('dspm.environment') === 'development',
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        },
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('dspm.rateLimitWindowMs') || 60000,
            limit: configService.get<number>('dspm.rateLimitMax') || 60,
          },
        ],
      }),
    }),

    // Kafka event bus
    KafkaModule,

    // DSPM adapter client
    DspmClientModule,

    // Feature modules
    HealthModule,
    DataSourceModule,
    AssetModule,
    SyncModule,
    LineageModule,
  ],
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global JWT auth guard (use @Public() to skip)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global RBAC guard
    {
      provide: APP_GUARD,
      useClass: RbacGuard,
    },
    // Global rate limiter
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Audit interceptor for mutations
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    // Tenant context extraction
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
})
export class AppModule {}
