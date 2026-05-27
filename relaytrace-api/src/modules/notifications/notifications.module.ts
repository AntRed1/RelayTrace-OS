import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { AlertProcessor } from '../queue/processors/alert.processor';

@Module({
  providers: [NotificationsService, EmailService, AlertProcessor],
  exports: [NotificationsService, EmailService],
})
export class NotificationsModule {}
