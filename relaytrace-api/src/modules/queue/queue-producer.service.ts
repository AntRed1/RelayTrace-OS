import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  QUEUE_OCR,
  QUEUE_RECONCILE,
  QUEUE_ALERT,
  OcrJobData,
  ReconcileJobData,
  AlertJobData,
} from './queue.types';

@Injectable()
export class QueueProducerService {
  constructor(
    @InjectQueue(QUEUE_OCR) private ocrQueue: Queue,
    @InjectQueue(QUEUE_RECONCILE) private reconcileQueue: Queue,
    @InjectQueue(QUEUE_ALERT) private alertQueue: Queue,
  ) {}

  async enqueueOcr(data: OcrJobData) {
    return this.ocrQueue.add('ocr', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async enqueueReconciliation(data: ReconcileJobData) {
    return this.reconcileQueue.add('reconcile', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async enqueueAlert(data: AlertJobData) {
    return this.alertQueue.add('alert', data, { attempts: 2 });
  }
}
