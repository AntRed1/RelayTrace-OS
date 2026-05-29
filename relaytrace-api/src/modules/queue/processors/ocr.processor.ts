import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_OCR, OcrJobData } from '../queue.types';
import { OcrService } from '../../ocr/ocr.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Processor(QUEUE_OCR)
export class OcrProcessor extends WorkerHost {
  private readonly logger = new Logger(OcrProcessor.name);

  constructor(
    private readonly ocrService: OcrService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<OcrJobData>): Promise<void> {
    const { tripId, blobPath } = job.data;

    this.logger.log(`OCR job ${job.id} — trip: ${tripId} — blob: ${blobPath}`);

    // Mark the trip as "processing" so the UI can show a spinner
    await this.prisma.trip.update({
      where: { id: tripId },
      data:  { ocrStatus: 'processing' },
    });

    const result = await this.ocrService.processAndSave(tripId, blobPath);

    this.logger.log(
      `OCR job ${job.id} done — ` +
      `success: ${result.success} · ` +
      `extracted: ${result.extractedTripId ?? 'none'} · ` +
      `confidence: ${result.confidence}`,
    );
  }
}
