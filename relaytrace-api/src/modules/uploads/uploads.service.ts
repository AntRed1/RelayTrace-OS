import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { AzureBlobService } from '../../common/azure-blob/azure-blob.service';

@Injectable()
export class UploadsService {
  private readonly screenshotsContainer: string;
  private readonly ocrContainer: string;

  constructor(
    private readonly blob: AzureBlobService,
    private readonly config: ConfigService,
  ) {
    this.screenshotsContainer = this.config.get<string>(
      'AZURE_STORAGE_CONTAINER_SCREENSHOTS',
      'screenshots',
    );
    this.ocrContainer = this.config.get<string>(
      'AZURE_STORAGE_CONTAINER_OCR',
      'ocr-documents',
    );
  }

  // ── Screenshot upload (all plans) ─────────────────────────────────────────

  /**
   * Upload a screenshot to Azure Blob Storage.
   *
   * Returns the blob PATH (e.g. "screenshots/{companyId}/{uuid}.jpg") — NOT a URL.
   * This path is stored as Trip.screenshotUrl in the DB.
   * TripsService converts blob paths to SAS URLs when returning trip data.
   */
  async uploadScreenshot(
    companyId: string,
    buffer: Buffer,
    mimetype: string,
    originalname: string,
  ): Promise<{ blobPath: string }> {
    const ext      = extname(originalname).toLowerCase() || '.jpg';
    const blobName = `${companyId}/${randomUUID()}${ext}`;

    const blobPath = await this.blob.upload(
      this.screenshotsContainer,
      blobName,
      buffer,
      mimetype,
    );

    return { blobPath };
  }

  // ── Presigned write URL for OCR documents (Growth+) ───────────────────────

  /**
   * Generate a short-lived write SAS URL so the client app can stream
   * a document directly to the ocr-documents container.
   * Expiry: 10 minutes (upload window).
   */
  async generatePresignedUrl(
    companyId: string,
    filename: string,
  ): Promise<{ uploadUrl: string; blobPath: string }> {
    const ext      = extname(filename).toLowerCase() || '.bin';
    const blobName = `${companyId}/${Date.now()}-${randomUUID()}${ext}`;

    // 'cw' = create + write permissions
    const uploadUrl = await this.blob.generateSasUrl(
      this.ocrContainer,
      blobName,
      10,      // 10 minutes
      'cw',   // write permissions
    );

    return {
      uploadUrl,
      blobPath: `${this.ocrContainer}/${blobName}`,
    };
  }
}
