import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { DspmSyncEntity } from '../../entities/dspm-sync.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DspmSyncEntity])],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
