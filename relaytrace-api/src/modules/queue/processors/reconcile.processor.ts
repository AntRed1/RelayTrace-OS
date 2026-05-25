import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_RECONCILE } from '../queue.types';
import { ReconciliationService } from '../../reconciliation/reconciliation.service';
import { ReconcileJobData } from '../queue.types';

@Processor(QUEUE_RECONCILE)
export class ReconcileProcessor extends WorkerHost {
  private readonly logger = new Logger(ReconcileProcessor.name);

  constructor(private reconciliationService: ReconciliationService) {
    super();
  }

  async process(job: Job<ReconcileJobData>): Promise<void> {
    this.logger.log(`Processing reconciliation job ${job.id}`);
    await this.reconciliationService.reconcile(job.data);
  }
}
