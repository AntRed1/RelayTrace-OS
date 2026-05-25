import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_OCR } from '../queue.types';
import { OcrService } from '../../ocr/ocr.service';
import { OcrJobData } from '../queue.types';

@Processor(QUEUE_OCR)
export class OcrProcessor extends WorkerHost {
  private readonly logger = new Logger(OcrProcessor.name);

  constructor(private ocrService: OcrService) {
    super();
  }

  async process(job: Job<OcrJobData>): Promise<void> {
    this.logger.log(`Processing OCR job ${job.id} for trip ${job.data.tripId}`);

    await this.ocrService.processAndSave(
      job.data.tripId,
      job.data.companyId,
      job.data.screenshotUrl,
    );
  }
}
