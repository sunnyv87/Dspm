import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncJob } from '../../entities/sync-job.entity';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { DataSourceModule } from '../data-source/data-source.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SyncJob]),
    DataSourceModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
