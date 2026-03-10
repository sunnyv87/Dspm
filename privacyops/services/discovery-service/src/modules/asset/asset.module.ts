import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataAsset } from '../../entities/data-asset.entity';
import { AssetLineage } from '../../entities/asset-lineage.entity';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataAsset, AssetLineage])],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService],
})
export class AssetModule {}
