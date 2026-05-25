/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SanitizeInterceptor } from './common/interceptors/sanitize.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bufferLogs: true,
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const logger = new Logger('Bootstrap');

  try {
    const PORT = Number(process.env.PORT) || 3000;
    const API_PREFIX = process.env.API_PREFIX || 'api';
    const NODE_ENV = process.env.NODE_ENV || 'development';

    // Security
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: NODE_ENV === 'production',
      }),
    );
    app.getHttpAdapter().getInstance().disable('x-powered-by');

    // CORS
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : ['http://localhost:3000', 'http://localhost:3001'];

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Content-Disposition'],
    });

    // Prefix & Versioning
    app.setGlobalPrefix(API_PREFIX);
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'v',
    });

    // Validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: true,
        transformOptions: { enableImplicitConversion: true },
        validationError: { target: false, value: false },
      }),
    );

    // Filters
    app.useGlobalFilters(
      new HttpExceptionFilter(),
      new PrismaExceptionFilter(),
    );

    // Interceptors
    app.useGlobalInterceptors(
      new SanitizeInterceptor(),
      new ResponseInterceptor(),
      new LoggingInterceptor(),
    );

    // Swagger — solo en no-producción
    if (NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('RelayTrace OS API')
        .setDescription(
          'API operacional de trazabilidad para empresas que utilizan Amazon Relay. ' +
            'Proporciona autenticación, gestión de conductores, registro de viajes, auditoría y reconciliación automática.',
        )
        .setVersion('1.0')
        .setContact(
          'RelayTrace',
          'https://relaytrace.com',
          'support@relaytrace.com',
        )
        .setLicense('UNLICENSED', '')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'Authorization',
            description: 'Ingresa el JWT token obtenido en POST /auth/login',
            in: 'header',
          },
          'JWT',
        )
        .addTag('Health', 'Estado del sistema y conectividad')
        .addTag('Auth', 'Autenticación y sesiones')
        .addTag('Companies', 'Gestión de empresas SaaS')
        .addTag('Users', 'Gestión de usuarios por empresa')
        .addTag('Drivers', 'Conductores y estadísticas operacionales')
        .addTag('Trips', 'Registro y trazabilidad de viajes — core del sistema')
        .addTag('Dashboard', 'KPIs y métricas operacionales')
        .addTag('Uploads', 'Subida de screenshots a Azure Blob Storage')
        .addTag('Billing', 'Suscripciones y facturación Stripe')
        .addTag('Relay Emails', 'Parsing de emails de Amazon Relay')
        .addTag(
          'Reconciliation',
          'Motor de reconciliación y detección de fraude',
        )
        .build();

      const document = SwaggerModule.createDocument(app, config);

      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
          docExpansion: 'none',
          filter: true,
          showRequestDuration: true,
        },

        customSiteTitle: 'RelayTrace OS — API Docs',
        customfavIcon: '/favicon.ico',

        customCss: `
    .swagger-ui .topbar {
      background-color: #0f172a;
      padding: 12px 0;
      border-bottom: 1px solid #1e293b;
    }

    .swagger-ui .topbar-wrapper img {
      content: url('/logos/logo-dark.png');
      width: 220px;
      height: auto;
    }

    .swagger-ui .topbar-wrapper svg,
    .swagger-ui .topbar-wrapper span {
      display: none;
    }

    .swagger-ui .topbar .download-url-wrapper {
      display: none;
    }

    .swagger-ui .info {
      margin: 30px 0;
    }

    .swagger-ui .info .title {
      color: #2563eb;
      font-size: 36px;
      font-weight: 700;
    }

    .swagger-ui .scheme-container {
      border-radius: 12px;
    }

    .swagger-ui .btn.authorize {
      background-color: #2563eb;
      border-color: #2563eb;
    }
  `,
      });
    }

    // Shutdown hooks
    app.enableShutdownHooks();

    await app.listen(PORT);
    const baseUrl = await app.getUrl();

    logger.log(`🚀 RelayTrace API running on ${baseUrl}/${API_PREFIX}/v1`);
    logger.log(`🩺 Health check: ${baseUrl}/${API_PREFIX}/v1/health`);

    if (NODE_ENV !== 'production') {
      logger.log(`📝 Swagger docs: ${baseUrl}/api/docs`);
    }

    logger.log(`🌍 Environment: ${NODE_ENV.toUpperCase()}`);
  } catch (error) {
    logger.error('❌ Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();
