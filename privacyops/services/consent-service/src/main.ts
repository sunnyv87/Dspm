import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('ConsentService');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3006;
  const corsOrigins = configService.get<string[]>('dspm.corsOrigins') || [
    'http://localhost:3000',
  ];

  // Global prefix
  app.setGlobalPrefix('api/v1/consent');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Tenant-Id',
      'X-Request-Id',
    ],
  });

  // Kafka microservice
  const kafkaBrokers = configService.get<string[]>('kafka.brokers') || [
    'localhost:9092',
  ];
  const kafkaGroupId =
    configService.get<string>('kafka.groupId') || 'consent-service-group';

  try {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId:
            configService.get<string>('kafka.clientId') || 'consent-service',
          brokers: kafkaBrokers,
        },
        consumer: {
          groupId: kafkaGroupId,
        },
      },
    });
    await app.startAllMicroservices();
    logger.log('Kafka microservice connected');
  } catch (error) {
    logger.warn(
      `Kafka microservice connection failed: ${(error as Error).message}. Continuing without Kafka consumer.`,
    );
  }

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TechD PrivacyOps Consent Service')
    .setDescription(
      'Multi-tenant consent management, tracking, and analytics API for the TechD PrivacyOps platform.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
      'bearer',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API key for service-to-service communication',
      },
      'api-key',
    )
    .addTag('Purposes', 'Consent purpose management')
    .addTag('Policies', 'Policy version management')
    .addTag('Consent Records', 'Consent capture, withdrawal, and tracking')
    .addTag('Webhooks', 'Webhook management for consent events')
    .addTag('Analytics', 'Consent analytics and reporting')
    .addTag('Health', 'Service health checks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs/consent', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
  logger.log(`Consent service running on port ${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs/consent`);
}

bootstrap();
