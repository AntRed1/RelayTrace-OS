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

  @IsOptional()
  @IsString()
  AZURE_STORAGE_CONNECTION_STRING?: string;

  @IsOptional()
  @IsString()
  AZURE_STORAGE_CONTAINER?: string;

  @IsOptional()
  @IsString()
  STRIPE_SECRET_KEY?: string;

  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @IsOptional()
  @IsString()
  REDIS_PORT?: string;
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
