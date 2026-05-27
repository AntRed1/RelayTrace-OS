import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Company CRUD ────────────────────────────────────────────────────────────

export class CreateCompanyDto {
  @ApiProperty({ example: 'Transportes Rápidos SRL' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'contacto@transportes.com' })
  @IsEmail()
  email: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Transportes Rápidos SRL' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'nuevo@transportes.com' })
  @IsEmail()
  @IsOptional()
  email?: string;
}

// ─── Public request-access (landing page) ────────────────────────────────────

export class RequestAccessDto {
  @ApiProperty({ example: 'Transportes del Norte LLC' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  contactName: string;

  @ApiProperty({ example: 'juan@transportes.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1 555 123 4567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9999)
  driverCount?: number;

  @ApiPropertyOptional({ example: 'Tenemos 3 cuentas de Relay compartidas...' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// ─── SUPER_ADMIN onboarding actions ──────────────────────────────────────────

export class ProcessRequestDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsEnum(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @ApiPropertyOptional({ example: 'Cuenta activada. Credenciales enviadas por email.' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class OnboardCompanyDto {
  @ApiProperty({ example: 'admin@transportes.com' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  adminName: string;

  @ApiProperty({ example: 'TempPass2026!' })
  @IsString()
  temporaryPassword: string;

  @ApiPropertyOptional({ enum: ['starter', 'growth', 'fleet'], default: 'starter' })
  @IsOptional()
  @IsEnum(['starter', 'growth', 'fleet'])
  plan?: 'starter' | 'growth' | 'fleet';
}

export class UpdateCompanyPlanDto {
  @ApiProperty({ enum: ['starter', 'growth', 'fleet'] })
  @IsEnum(['starter', 'growth', 'fleet'])
  plan: 'starter' | 'growth' | 'fleet';
}
