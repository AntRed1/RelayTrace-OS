import { Module } from '@nestjs/common';
import { BillingController }   from './billing.controller';
import { BillingService }      from './billing.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PlansModule }         from '../plans/plans.module';

@Module({
  imports:     [NotificationsModule, PlansModule],
  controllers: [BillingController],
  providers:   [BillingService],
  exports:     [BillingService],
})
export class BillingModule {}
