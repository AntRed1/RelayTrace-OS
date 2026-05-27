import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ─── Public pre-registration checkout ────────────────────────────────────────

/**
 * Sent by the landing page BEFORE a company exists in our DB.
 * Company data is stored in Stripe session metadata and replayed
 * on the `checkout.session.completed` webhook to create the Company + User.
 */
export class PreRegistrationCheckoutDto {
  @ApiProperty({ example: 'Transportes del Norte LLC' })
  @IsString()
  @MinLength(2)
  companyName: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  contactName: string;

  @ApiProperty({ example: 'juan@transportes.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1 555 123 4567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsInt()
  @Min(1)
  @Max(9999)
  @Type(() => Number)
  @IsOptional()
  driverCount?: number;

  @ApiProperty({ enum: ['starter', 'growth', 'fleet'] })
  @IsEnum(['starter', 'growth', 'fleet'])
  plan: 'starter' | 'growth' | 'fleet';

  @ApiProperty({ example: 'https://app.relaytrace.com/onboarding/success' })
  @IsUrl()
  successUrl: string;

  @ApiProperty({ example: 'https://app.relaytrace.com/onboarding/cancel' })
  @IsUrl()
  cancelUrl: string;
}

// ─── Legacy (kept for backward compat, unused in new flow) ───────────────────

export class CreateCheckoutDto {
  @IsString()
  priceId: string;

  @IsUrl()
  successUrl: string;

  @IsUrl()
  cancelUrl: string;
}
