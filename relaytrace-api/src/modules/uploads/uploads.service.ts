/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';

@Injectable()
export class UploadsService {
  private containerName: string;
  private accountName: string;
  private accountKey: string;

  constructor(private config: ConfigService) {
    this.containerName = this.config.get<string>(
      'AZURE_STORAGE_CONTAINER',
    ) as string;
    this.accountName = this.config.get<string>(
      'AZURE_STORAGE_ACCOUNT_NAME',
    ) as string;
    this.accountKey = this.config.get<string>(
      'AZURE_STORAGE_ACCOUNT_KEY',
    ) as string;
  }

  async generatePresignedUrl(companyId: string, filename: string) {
    const blobName = `${companyId}/${Date.now()}-${filename}`;
    const sharedKeyCredential = new StorageSharedKeyCredential(
      this.accountName,
      this.accountKey,
    );

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName,
        permissions: BlobSASPermissions.parse('cw'),
        expiresOn: new Date(Date.now() + 10 * 60 * 1000),
      },
      sharedKeyCredential,
    ).toString();

    const url = `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}?${sasToken}`;
    return { uploadUrl: url, blobName };
  }
}
