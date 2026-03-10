import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('DspmAdapterService');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1/dspm');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('PrivacyOps DSPM Adapter')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs/dspm', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT || 3005;
  await app.listen(port);
  logger.log(`DSPM Adapter running on port ${port}`);
}
bootstrap();
