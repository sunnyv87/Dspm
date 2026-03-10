import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServiceClientService } from './service-client.service';

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get<number>('http.timeout', 5000),
        maxRedirects: configService.get<number>('http.maxRedirects', 3),
      }),
    }),
  ],
  providers: [ServiceClientService],
  exports: [ServiceClientService],
})
export class ServiceClientModule {}
