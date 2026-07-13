import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorrelationLogger } from './common/logger/correlation.logger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import helmet from 'helmet';
import { AuthenticatedIoAdapter } from './iam/websockets/authenticated-io.adapter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  // 1. Global Logger Binding
  const correlationLogger = new CorrelationLogger();
  app.useLogger(correlationLogger);

  // WebSocket Authentication Adapter
  app.useWebSocketAdapter(new AuthenticatedIoAdapter(app));
  
  const logger = new Logger('Bootstrap');

  // Global API prefix
  app.setGlobalPrefix('api');

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  // Helmet Security
  app.use(helmet());

  // Strict CORS Lockdown
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl.split(',').map((s: string) => s.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Exception Filter — consistent JSON error envelope with correlationId
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger (Disabled in Production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('DukaanAI API')
      .setDescription('The DukaanAI API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('PORT') || 3002;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
