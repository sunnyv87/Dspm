import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DspmIntegrationController } from './dspm-integration.controller';
import { DspmIntegrationService } from './dspm-integration.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
  ],
  controllers: [DspmIntegrationController],
  providers: [DspmIntegrationService],
  exports: [DspmIntegrationService],
})
export class DspmIntegrationModule {}
