import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import appConfig from './config/app.config';
import { validate } from './config/validation';

import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { TripsModule } from './modules/trips/trips.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AuditModule } from './modules/audit/audit.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BillingModule } from './modules/billing/billing.module';
import { QueueModule } from './modules/queue/queue.module';
import { OcrModule } from './modules/ocr/ocr.module';
import { RelayEmailsModule } from './modules/relay-emails/relay-emails.module';
import { ReconciliationModule } from './modules/reconciliation/reconciliation.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      load: [appConfig],
      validate,
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 }, // 10 req/seg
      { name: 'long', ttl: 60000, limit: 100 }, // 100 req/min
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    CompaniesModule,
    UsersModule,
    RolesModule,
    DriversModule,
    TripsModule,
    UploadsModule,
    AuditModule,
    DashboardModule,
    BillingModule,
    QueueModule,
    OcrModule,
    RelayEmailsModule,
    ReconciliationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
