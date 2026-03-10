import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api/v1/dashboard');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors({
    origin: configService.get<string>('cors.origin', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Dashboard BFF API')
    .setDescription('Backend-For-Frontend service aggregating data from all PrivacyOps microservices')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('overview', 'Dashboard overview and summary')
    .addTag('risk', 'Risk dashboard')
    .addTag('compliance', 'Compliance dashboard')
    .addTag('activity', 'Activity feed')
    .addTag('health', 'Health checks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs/dashboard', app, document);

  // Kafka microservice
  const kafkaBrokers = configService.get<string>('kafka.brokers', 'localhost:9092');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'dashboard-bff',
        brokers: kafkaBrokers.split(','),
      },
      consumer: {
        groupId: 'dashboard-bff-group',
      },
    },
  });

  await app.startAllMicroservices();

  const port = configService.get<number>('port', 3010);
  await app.listen(port);

  logger.log(`Dashboard BFF service is running on port ${port}`);
  logger.log(`Swagger docs available at /api/docs/dashboard`);
}

bootstrap();
