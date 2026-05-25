import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AlertProcessor } from '../queue/processors/alert.processor';

@Module({
  providers: [NotificationsService, AlertProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
