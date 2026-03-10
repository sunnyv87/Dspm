import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security headers
  app.use(helmet());

  // Kafka microservice transport
  const kafkaBrokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: process.env.KAFKA_CLIENT_ID || 'audit-ledger-service',
        brokers: kafkaBrokers,
        ssl: process.env.KAFKA_SSL === 'true',
        ...(process.env.KAFKA_SASL_USERNAME && {
          sasl: {
            mechanism: (process.env.KAFKA_SASL_MECHANISM as any) || 'plain',
            username: process.env.KAFKA_SASL_USERNAME,
            password: process.env.KAFKA_SASL_PASSWORD,
          },
        }),
        connectionTimeout: parseInt(process.env.KAFKA_CONNECTION_TIMEOUT, 10) || 3000,
        requestTimeout: parseInt(process.env.KAFKA_REQUEST_TIMEOUT, 10) || 30000,
      },
      consumer: {
        groupId: process.env.KAFKA_GROUP_ID || 'audit-ledger-consumer',
        allowAutoTopicCreation: false,
      },
    },
  });

  // Global validation pipe
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

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Audit Ledger Service')
    .setDescription('Immutable audit logging API for TechD PrivacyOps platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'internal-api-key')
    .addTag('audit', 'Audit entry operations')
    .addTag('ingestion', 'Internal audit ingestion')
    .addTag('health', 'Health checks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Start microservices
  await app.startAllMicroservices();
  logger.log('Kafka microservice connected');

  // Start HTTP server
  const port = parseInt(process.env.PORT, 10) || 3007;
  await app.listen(port);
  logger.log(`Audit Ledger Service listening on port ${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
