import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetLineage } from '../../entities/asset-lineage.entity';
import { DataAsset } from '../../entities/data-asset.entity';
import { LineageController } from './lineage.controller';
import { LineageService } from './lineage.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssetLineage, DataAsset])],
  controllers: [LineageController],
  providers: [LineageService],
  exports: [LineageService],
})
export class LineageModule {}
