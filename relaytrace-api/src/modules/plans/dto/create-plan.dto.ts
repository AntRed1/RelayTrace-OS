import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'growth', description: 'URL-safe unique identifier' })
  @IsString()
  @Matches(/^[a-z0-9_-]+$/, { message: 'slug must be lowercase alphanumeric with dashes/underscores' })
  slug: string;

  @ApiProperty({ example: 'Growth' })
  @IsString()
  @MaxLength(80)
  displayName: string;

  @ApiProperty({ example: 'For growing operations that need automation.' })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: 149, description: 'Monthly price in USD. Use 0 for contact-sales plans.' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceMonthly: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 20, description: 'Maximum active drivers. Omit or null for unlimited.' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  maxDrivers?: number | null;

  @ApiProperty({
    type: [String],
    example: ['OCR screenshot → Trip ID', 'Anti-fraud alerts'],
    description: 'Human-readable bullet points displayed on the pricing card.',
  })
  @IsArray()
  @IsString({ each: true })
  featureLabels: string[];

  @ApiProperty({
    type: [String],
    example: ['ocr', 'reconciliation'],
    description: 'Internal PlanFeature keys consumed by PlanGuard.',
  })
  @IsArray()
  @IsString({ each: true })
  featureFlags: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: 'Get Started' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  ctaLabel?: string;
}
