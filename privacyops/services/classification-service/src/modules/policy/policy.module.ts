import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassificationPolicy } from '../../entities/classification-policy.entity';
import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClassificationPolicy])],
  controllers: [PolicyController],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}
