import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { ComplianceScan } from './entities/compliance-scan.entity';
import { ComplianceFinding } from './entities/compliance-finding.entity';
import { ComplianceFramework } from './entities/compliance-framework.entity';
import { RemediationSuggestion } from './entities/remediation-suggestion.entity';
import { HealthModule } from './modules/health/health.module';
import { ScanModule } from './modules/scan/scan.module';
import { FindingModule } from './modules/finding/finding.module';
import { FrameworkModule } from './modules/framework/framework.module';
import { RemediationModule } from './modules/remediation/remediation.module';
import { DspmIntegrationModule } from './modules/dspm-integration/dspm-integration.module';
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
          ? { rejectUnauthorized: false }
          : false,
        entities: [ComplianceScan, ComplianceFinding, ComplianceFramework, RemediationSuggestion],
        synchronize: false,
        logging: configService.get<string>('dspm.environment') === 'development',
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        },
      }),
    }),

    // Kafka event bus
    KafkaModule,

    // Feature modules
    HealthModule,
    ScanModule,
    FindingModule,
    FrameworkModule,
    RemediationModule,
    DspmIntegrationModule,
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
