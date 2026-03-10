import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('NotificationService');
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  app.setGlobalPrefix('api/v1/notifications');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('PrivacyOps Notification Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs/notifications', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT || 3003;
  await app.listen(port);
  logger.log(`Notification service running on port ${port}`);
}
bootstrap();
