import { Module, Global } from '@nestjs/common';
import { DspmClientService } from './dspm-client.service';

@Global()
@Module({
  providers: [DspmClientService],
  exports: [DspmClientService],
})
export class DspmClientModule {}
