import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentRecord } from '../../entities/consent-record.entity';
import { ConsentPurpose } from '../../entities/consent-purpose.entity';
import { PolicyVersion } from '../../entities/policy-version.entity';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConsentRecord, ConsentPurpose, PolicyVersion])],
  controllers: [ConsentController],
  providers: [ConsentService],
  exports: [ConsentService],
})
export class ConsentModule {}
