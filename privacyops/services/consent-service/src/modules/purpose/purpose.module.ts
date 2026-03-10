import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentPurpose } from '../../entities/consent-purpose.entity';
import { PolicyVersion } from '../../entities/policy-version.entity';
import { PurposeController } from './purpose.controller';
import { PurposeService } from './purpose.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConsentPurpose, PolicyVersion])],
  controllers: [PurposeController],
  providers: [PurposeService],
  exports: [PurposeService],
})
export class PurposeModule {}
