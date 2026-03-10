import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { WorkflowEntity } from './entities/workflow.entity';
import { WorkflowStepEntity } from './entities/workflow-step.entity';
import { WorkflowTemplateEntity } from './entities/workflow-template.entity';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { TemplateModule } from './modules/template/template.module';
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
        entities: [WorkflowEntity, WorkflowStepEntity, WorkflowTemplateEntity],
        synchronize: cs.get('database.synchronize'),
        logging: cs.get('database.logging'),
      }),
    }),
    WorkflowModule,
    TemplateModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
