import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { RequireFeature } from '../../common/decorators/require-feature.decorator';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class PresignedUrlDto {
  @ApiProperty({ example: 'screenshot-trip-123.jpg' })
  @IsString()
  filename: string;
}

@ApiTags('Uploads')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard, PlanGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presigned-url')
  @RequireFeature('ocr')          // OCR screenshots require Growth+
  @ApiOperation({
    summary: 'Generar URL pre-firmada para OCR',
    description: 'Genera URL de Azure Blob Storage. Requiere plan Growth o superior.',
  })
  @ApiBody({ type: PresignedUrlDto })
  @ApiResponse({ status: 201, description: 'URL pre-firmada generada' })
  @ApiResponse({ status: 402, description: 'Plan Growth requerido' })
  getPresignedUrl(@Request() req, @Body() dto: PresignedUrlDto) {
    return this.uploadsService.generatePresignedUrl(
      req.user.companyId,
      dto.filename,
    );
  }
}
