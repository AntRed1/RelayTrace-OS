/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentAnalysisClient,
  AzureKeyCredential,
} from '@azure/ai-form-recognizer';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private client: DocumentAnalysisClient | null = null;
  private readonly TRIP_ID_PATTERN = /\bT-\d{9,12}\b/i;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  private getClient(): DocumentAnalysisClient {
    if (!this.client) {
      const endpoint = this.config.get<string>(
        'AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT',
      );
      const key = this.config.get<string>('AZURE_DOCUMENT_INTELLIGENCE_KEY');

      if (!endpoint || !key) {
        throw new Error(
          'Azure Document Intelligence credentials not configured',
        );
      }

      this.client = new DocumentAnalysisClient(
        endpoint,
        new AzureKeyCredential(key),
      );
    }
    return this.client;
  }

  async extractTripId(screenshotUrl: string): Promise<{
    tripId: string | null;
    confidence: number;
    rawText: string;
  }> {
    try {
      const poller = await this.getClient().beginAnalyzeDocumentFromUrl(
        'prebuilt-read',
        screenshotUrl,
      );
      const result = await poller.pollUntilDone();
      const rawText = result.content ?? '';
      const match = rawText.match(this.TRIP_ID_PATTERN);
      return {
        tripId: match ? match[0] : null,
        confidence: match ? 0.95 : 0,
        rawText,
      };
    } catch (err) {
      this.logger.error(`OCR extraction failed: ${err.message}`, err.stack);
      return { tripId: null, confidence: 0, rawText: '' };
    }
  }

  async processAndSave(
    tripDbId: string,
    companyId: string,
    screenshotUrl: string,
  ) {
    const { tripId, confidence, rawText } =
      await this.extractTripId(screenshotUrl);

    await this.prisma.oCRResult.create({
      data: {
        tripId: tripDbId,
        extractedTripId: tripId,
        confidenceScore: confidence,
        rawText,
      },
    });

    if (tripId) {
      await this.prisma.trip.update({
        where: { id: tripDbId },
        data: { tripId, sourceType: 'ocr', status: 'confirmed' },
      });
      this.logger.log(`OCR extracted Trip ID ${tripId} for trip ${tripDbId}`);
    } else {
      this.logger.warn(`OCR found no Trip ID for trip ${tripDbId}`);
    }

    return { tripId, confidence };
  }
}
