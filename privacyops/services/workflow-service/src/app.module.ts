import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { WorkflowDefinition } from './entities/workflow-definition.entity';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { WorkflowTask } from './entities/workflow-task.entity';
import { ApprovalRecord } from './entities/approval-record.entity';
import { HealthModule } from './modules/health/health.module';
import { DefinitionModule } from './modules/definition/definition.module';
import { InstanceModule } from './modules/instance/instance.module';
import { TaskModule } from './modules/task/task.module';
import { ApprovalModule } from './modules/approval/approval.module';
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
        entities: [WorkflowDefinition, WorkflowInstance, WorkflowTask, ApprovalRecord],
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
    DefinitionModule,
    InstanceModule,
    TaskModule,
    ApprovalModule,
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
