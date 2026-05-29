import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
  UserDelegationKey,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DelegationKeyCache {
  key: UserDelegationKey;
  expiresAt: Date;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Centralises all Azure Blob Storage operations.
 *
 * Auth strategy (auto-selected at startup):
 *  - AZURE_STORAGE_ACCOUNT_KEY is set → StorageSharedKeyCredential
 *    (local dev with Azurite or a real storage account)
 *  - Only AZURE_STORAGE_ACCOUNT_NAME is set → DefaultAzureCredential
 *    (production MSI, or dev with `az login`)
 *
 * SAS URL generation:
 *  - Shared key mode   → account-key SAS (signed locally, instant)
 *  - MSI mode          → user-delegation SAS (key cached 90 min, first call hits Azure once)
 */
@Injectable()
export class AzureBlobService {
  private readonly logger = new Logger(AzureBlobService.name);

  private client!: BlobServiceClient;
  private readonly accountName: string;
  private readonly sharedKeyCredential: StorageSharedKeyCredential | null = null;
  private readonly isEnabled: boolean;

  private delegationKeyCache: DelegationKeyCache | null = null;

  constructor(private readonly config: ConfigService) {
    this.accountName = this.config.get<string>('AZURE_STORAGE_ACCOUNT_NAME', '');
    const accountKey  = this.config.get<string>('AZURE_STORAGE_ACCOUNT_KEY', '');

    if (!this.accountName) {
      this.logger.warn(
        'AZURE_STORAGE_ACCOUNT_NAME is not set — Azure Blob Storage is DISABLED. ' +
        'Set it in .env.local for local development.',
      );
      this.isEnabled = false;
      return;
    }

    const endpoint = `https://${this.accountName}.blob.core.windows.net`;

    if (accountKey) {
      // ── Dev / Azurite: shared key credential ─────────────────────────────
      this.sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, accountKey);
      this.client = new BlobServiceClient(endpoint, this.sharedKeyCredential);
      this.logger.log(`Azure Blob: shared key (dev) — account: ${this.accountName}`);
    } else {
      // ── Production: Managed Identity / Azure CLI ──────────────────────────
      this.client = new BlobServiceClient(endpoint, new DefaultAzureCredential());
      this.logger.log(`Azure Blob: DefaultAzureCredential (MSI) — account: ${this.accountName}`);
    }

    this.isEnabled = true;
  }

  // ── Upload ─────────────────────────────────────────────────────────────────

  /**
   * Upload a buffer to the specified container.
   * Returns the blob PATH (e.g. "screenshots/companyId/uuid.jpg") — NOT a URL.
   * Use generateSasUrl() to get a time-limited readable URL.
   */
  async upload(
    container: string,
    blobName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    this.assertEnabled();

    const blockBlobClient = this.client
      .getContainerClient(container)
      .getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    return `${container}/${blobName}`;
  }

  // ── SAS URL generation ────────────────────────────────────────────────────

  /**
   * Generate a time-limited SAS URL for a blob.
   * @param permissions  BlobSAS permission string, e.g. 'r' (read), 'cw' (create+write), 'rcwd'
   * @param expiryMinutes  How long the URL is valid (default: 60)
   */
  async generateSasUrl(
    container: string,
    blobName: string,
    expiryMinutes = 60,
    permissions = 'r',
  ): Promise<string> {
    this.assertEnabled();

    const startsOn  = new Date();
    const expiresOn = new Date(Date.now() + expiryMinutes * 60_000);

    const blobPermissions = BlobSASPermissions.parse(permissions);

    let query: string;

    if (this.sharedKeyCredential) {
      // ── Shared key SAS (instant, local signing) ───────────────────────────
      query = generateBlobSASQueryParameters(
        { containerName: container, blobName, permissions: blobPermissions, startsOn, expiresOn, protocol: SASProtocol.Https },
        this.sharedKeyCredential,
      ).toString();
    } else {
      // ── User-delegation SAS (MSI) — delegation key cached 90 min ─────────
      const delegationKey = await this.getCachedDelegationKey();
      query = generateBlobSASQueryParameters(
        { containerName: container, blobName, permissions: blobPermissions, startsOn, expiresOn, protocol: SASProtocol.Https },
        delegationKey,
        this.accountName,
      ).toString();
    }

    const blobClient = this.client
      .getContainerClient(container)
      .getBlobClient(blobName);

    return `${blobClient.url}?${query}`;
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async delete(container: string, blobName: string): Promise<void> {
    this.assertEnabled();
    await this.client
      .getContainerClient(container)
      .deleteBlob(blobName);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Parse "screenshots/companyId/uuid.jpg" → { container, blobName }.
   * Returns null if the string does not look like a valid blob path.
   */
  static parseBlobPath(path: string): { container: string; blobName: string } | null {
    const idx = path.indexOf('/');
    if (idx < 1) return null;
    return { container: path.slice(0, idx), blobName: path.slice(idx + 1) };
  }

  /**
   * A blob path does NOT start with "http" or "/" (those are HTTP URLs or legacy disk paths).
   */
  static isBlobPath(value: string | null | undefined): boolean {
    if (!value) return false;
    return !value.startsWith('http') && !value.startsWith('/');
  }

  // ── Private: delegation key cache ────────────────────────────────────────

  private async getCachedDelegationKey(): Promise<UserDelegationKey> {
    const now = new Date();

    if (this.delegationKeyCache && this.delegationKeyCache.expiresAt > now) {
      return this.delegationKeyCache.key;
    }

    // Request a key valid for 2 hours; cache for 1.5 hours to avoid last-minute expiry.
    const keyExpiry = new Date(Date.now() + 2 * 3600_000);
    const key = await this.client.getUserDelegationKey(now, keyExpiry);

    this.delegationKeyCache = {
      key,
      expiresAt: new Date(Date.now() + 90 * 60_000),
    };

    this.logger.debug('User delegation key refreshed (valid 2 h, cached 1.5 h)');
    return key;
  }

  private assertEnabled(): void {
    if (!this.isEnabled) {
      throw new Error(
        'Azure Blob Storage is not configured. ' +
        'Set AZURE_STORAGE_ACCOUNT_NAME (and optionally AZURE_STORAGE_ACCOUNT_KEY for dev).',
      );
    }
  }
}
