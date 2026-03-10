import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyVersion } from '../../entities/policy-version.entity';
import { ConsentPurpose } from '../../entities/consent-purpose.entity';
import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyVersion, ConsentPurpose])],
  controllers: [PolicyController],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}
