import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateTripDto {
  @ApiProperty({
    example: 'T-123456789',
    description: 'Trip ID de Amazon Relay',
  })
  @IsString()
  tripId: string;

  @ApiPropertyOptional({
    example: 'https://storage.azure.com/...',
    description: 'URL del screenshot para OCR',
  })
  @IsOptional()
  @IsString()
  screenshotUrl?: string;
}

export class UpdateTripDto {
  @ApiPropertyOptional({ enum: ['pending', 'confirmed', 'flagged'] })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'flagged'])
  status?: 'pending' | 'confirmed' | 'flagged';

  @ApiPropertyOptional({ example: 'https://storage.azure.com/...' })
  @IsOptional()
  @IsString()
  screenshotUrl?: string;
}

export class TripFilterDto {
  @ApiPropertyOptional({ example: 'cmpirr6890000wgedojwrg3ud' })
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiPropertyOptional({ enum: ['pending', 'confirmed', 'flagged'] })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'flagged'])
  status?: 'pending' | 'confirmed' | 'flagged';

  @ApiPropertyOptional({ example: 'T-123456789' })
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiPropertyOptional({
    example: 'manual',
    enum: ['manual', 'ocr', 'relay_email'],
  })
  @IsOptional()
  @IsString()
  sourceType?: string;
}
