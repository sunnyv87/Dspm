import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RbacGuard } from './common/guards/rbac.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { KafkaModule } from './common/kafka/kafka.module';
import { HealthModule } from './modules/health/health.module';
import { OverviewModule } from './modules/overview/overview.module';
import { RiskDashboardModule } from './modules/risk/risk-dashboard.module';
import { ComplianceDashboardModule } from './modules/compliance/compliance-dashboard.module';
import { ActivityModule } from './modules/activity/activity.module';
import { ServiceClientModule } from './modules/service-client/service-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get<number>('http.timeout', 5000),
        maxRedirects: configService.get<number>('http.maxRedirects', 3),
      }),
    }),
    KafkaModule,
    HealthModule,
    ServiceClientModule,
    OverviewModule,
    RiskDashboardModule,
    ComplianceDashboardModule,
    ActivityModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RbacGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    AuditInterceptor,
    TenantContextInterceptor,
  ],
})
export class AppModule {}
