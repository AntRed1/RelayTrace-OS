/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentAnalysisClient,
  AzureKeyCredential,
} from '@azure/ai-form-recognizer';
import { PrismaService } from '../../prisma/prisma.service';
import { AzureBlobService } from '../../common/azure-blob/azure-blob.service';

// ─── Constants ────────────────────────────────────────────────────────────────

// Amazon Relay Trip ID format: starts with a letter then digits, 9-12 chars.
// Example: T-123456789  or  TBA123456789
const TRIP_ID_PATTERN = /\b(?:T-\d{9,12}|TBA\d{9,12})\b/i;

// SAS URL expiry for Document Intelligence (5 min is enough for a single call)
const OCR_SAS_EXPIRY_MINUTES = 5;

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * OcrService — wraps Azure AI Document Intelligence (prebuilt-read model).
 *
 * processAndSave() is called by the OCR BullMQ processor (Step 3).
 * It:
 *   1. Generates a short-lived SAS URL from the blob path (MSI-based)
 *   2. Sends the image to Document Intelligence for text extraction
 *   3. Parses the Relay Trip ID from the raw text
 *   4. Saves an OCRResult record with status + extracted data
 *   5. Updates Trip.ocrStatus (and Trip.tripId + sourceType on success)
 *
 * NOTE (Phase 3 Step 3): The BullMQ processor will call this service
 * and set Trip.ocrStatus = 'processing' BEFORE calling processAndSave().
 * This service sets the final status ('completed' | 'failed').
 */
@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private client: DocumentAnalysisClient | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly blobService: AzureBlobService,
  ) {}

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Full OCR pipeline for a single trip screenshot.
   *
   * @param tripDbId  DB id of the Trip record
   * @param blobPath  Azure Blob path (e.g. "screenshots/{companyId}/{uuid}.jpg")
   */
  async processAndSave(tripDbId: string, blobPath: string): Promise<{
    success: boolean;
    extractedTripId: string | null;
    confidence: number;
  }> {
    const startTime = Date.now();

    try {
      // 1. Generate a short-lived SAS URL so Document Intelligence can read the blob
      const parsed = AzureBlobService.parseBlobPath(blobPath);
      if (!parsed) throw new Error(`Invalid blob path: ${blobPath}`);

      const sasUrl = await this.blobService.generateSasUrl(
        parsed.container,
        parsed.blobName,
        OCR_SAS_EXPIRY_MINUTES,
      );

      // 2. Run Document Intelligence
      const { tripId, confidence, rawText } = await this.extractTripId(sasUrl);
      const processingTimeMs = Date.now() - startTime;

      // 3. Persist the OCRResult
      await this.prisma.oCRResult.create({
        data: {
          tripId:          tripDbId,
          blobPath,
          status:          'completed',
          extractedTripId: tripId,
          confidenceScore: confidence,
          rawText,
          processingTimeMs,
        },
      });

      // 4. Update the Trip
      if (tripId) {
        await this.prisma.trip.update({
          where: { id: tripDbId },
          data: {
            tripId,
            sourceType: 'ocr',
            status:     'confirmed',
            ocrStatus:  'completed',
          },
        });
        this.logger.log(
          `OCR extracted Trip ID "${tripId}" (confidence ${confidence}) for trip ${tripDbId}`,
        );
      } else {
        await this.prisma.trip.update({
          where: { id: tripDbId },
          data: { ocrStatus: 'completed' },
        });
        this.logger.warn(
          `OCR completed but no Trip ID found for trip ${tripDbId} (${processingTimeMs} ms)`,
        );
      }

      return { success: true, extractedTripId: tripId, confidence };
    } catch (err) {
      const processingTimeMs = Date.now() - startTime;
      const errorMessage = (err as Error).message ?? String(err);

      this.logger.error(
        `OCR failed for trip ${tripDbId}: ${errorMessage}`,
        (err as Error).stack,
      );

      // Persist failure record
      await this.prisma.oCRResult.create({
        data: {
          tripId:          tripDbId,
          blobPath,
          status:          'failed',
          errorMessage,
          processingTimeMs,
        },
      });

      await this.prisma.trip.update({
        where: { id: tripDbId },
        data: { ocrStatus: 'failed' },
      });

      return { success: false, extractedTripId: null, confidence: 0 };
    }
  }

  // ── Private: Document Intelligence call ───────────────────────────────────

  private async extractTripId(imageUrl: string): Promise<{
    tripId: string | null;
    confidence: number;
    rawText: string;
  }> {
    const poller = await this.getClient().beginAnalyzeDocumentFromUrl(
      'prebuilt-read',
      imageUrl,
    );
    const result = await poller.pollUntilDone();
    const rawText = result.content ?? '';
    const match   = rawText.match(TRIP_ID_PATTERN);

    return {
      tripId:     match ? match[0] : null,
      confidence: match ? 0.95 : 0,
      rawText,
    };
  }

  private getClient(): DocumentAnalysisClient {
    if (!this.client) {
      const endpoint = this.config.get<string>('AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT');
      const key      = this.config.get<string>('AZURE_DOCUMENT_INTELLIGENCE_KEY');

      if (!endpoint || !key) {
        throw new Error(
          'Azure Document Intelligence is not configured. ' +
          'Set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_KEY.',
        );
      }

      this.client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    }
    return this.client;
  }
}
