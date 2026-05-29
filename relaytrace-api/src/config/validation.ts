import { plainToClass } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  validateSync,
} from 'class-validator';

export class EnvVariables {
  @IsNotEmpty()
  @IsString()
  NODE_ENV: string;

  @IsNotEmpty()
  @IsString()
  PORT: string;

  @IsNotEmpty()
  @IsString()
  DATABASE_URL: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRATION?: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_EXPIRATION?: string;

  // ── Azure Blob Storage ─────────────────────────────────────────────────────
  // Production: set AZURE_STORAGE_ACCOUNT_NAME only — uses Managed Identity.
  // Dev/Azurite: set both AZURE_STORAGE_ACCOUNT_NAME + AZURE_STORAGE_ACCOUNT_KEY.

  @IsOptional()
  @IsString()
  AZURE_STORAGE_ACCOUNT_NAME?: string;

  @IsOptional()
  @IsString()
  AZURE_STORAGE_ACCOUNT_KEY?: string;   // dev/Azurite only — NOT needed in production

  @IsOptional()
  @IsString()
  AZURE_STORAGE_CONTAINER_SCREENSHOTS?: string;

  @IsOptional()
  @IsString()
  AZURE_STORAGE_CONTAINER_OCR?: string;

  @IsOptional()
  @IsString()
  AZURE_STORAGE_CONTAINER_EXPORTS?: string;

  // ── Stripe ─────────────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  STRIPE_SECRET_KEY?: string;

  @IsOptional()
  @IsString()
  STRIPE_WEBHOOK_SECRET?: string;

  // ── Redis ──────────────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @IsOptional()
  @IsString()
  REDIS_PORT?: string;

  // ── ACS Email ──────────────────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  ACS_CONNECTION_STRING?: string;

  @IsOptional()
  @IsString()
  ACS_FROM_ADDRESS?: string;

  // ── Application Insights ───────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  APPLICATIONINSIGHTS_CONNECTION_STRING?: string;

  // ── Azure Document Intelligence ────────────────────────────────────────────

  @IsOptional()
  @IsString()
  AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT?: string;

  @IsOptional()
  @IsString()
  AZURE_DOCUMENT_INTELLIGENCE_KEY?: string;

  // ── Prisma Seed Configuration ──────────────────────────────────────────────

  @IsOptional()
  @IsString()
  SEED_COMPANY_NAME?: string;

  @IsOptional()
  @IsString()
  SEED_COMPANY_EMAIL?: string;

  @IsOptional()
  @IsString()
  SEED_ADMIN_NAME?: string;

  @IsOptional()
  @IsString()
  SEED_ADMIN_EMAIL?: string;

  @IsOptional()
  @IsString()
  SEED_ADMIN_PASSWORD?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Env validation failed: ${errors.toString()}`);
  }

  return validatedConfig;
}
