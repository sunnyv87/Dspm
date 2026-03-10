import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { DspmSyncEntity } from './entities/dspm-sync.entity';
import { DspmClientModule } from './modules/dspm-client/dspm-client.module';
import { ConnectorModule } from './modules/connector/connector.module';
import { ScanModule } from './modules/scan/scan.module';
import { AssetModule } from './modules/asset/asset.module';
import { ClassificationModule } from './modules/classification/classification.module';
import { RiskModule } from './modules/risk/risk.module';
import { SyncModule } from './modules/sync/sync.module';
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
        entities: [DspmSyncEntity],
        synchronize: cs.get('database.synchronize'),
      }),
    }),
    DspmClientModule,
    ConnectorModule,
    ScanModule,
    AssetModule,
    ClassificationModule,
    RiskModule,
    SyncModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
