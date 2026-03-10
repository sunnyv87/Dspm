import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiTokenService } from './api-token.service';
import { ApiTokenController } from './api-token.controller';
import { ApiToken } from '../../entities/api-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiToken])],
  controllers: [ApiTokenController],
  providers: [ApiTokenService],
  exports: [ApiTokenService],
})
export class ApiTokenModule {}
