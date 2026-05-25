import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_ALERT } from '../queue.types';
import { NotificationsService } from '../../notifications/notifications.service';
import { AlertJobData } from '../queue.types';

@Processor(QUEUE_ALERT)
export class AlertProcessor extends WorkerHost {
  private readonly logger = new Logger(AlertProcessor.name);

  constructor(private notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<AlertJobData>): Promise<void> {
    this.logger.log(
      `Processing alert job ${job.id} type ${job.data.alertType}`,
    );

    await this.notificationsService.notify({
      companyId: job.data.companyId,
      tripId: job.data.tripId,
      alertType: job.data.alertType,
      message: `Alert: ${job.data.alertType} detected`,
      channel: 'dashboard',
    });
  }
}
