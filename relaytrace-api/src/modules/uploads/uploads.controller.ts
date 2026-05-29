import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { RequireFeature } from '../../common/decorators/require-feature.decorator';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

class PresignedUrlDto {
  @ApiProperty({ example: 'bill-of-lading.jpg' })
  @IsString()
  filename: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── Controller ────────────────────────────────────────────────────────────────

@ApiTags('Uploads')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard, PlanGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // ── Presigned URL for Azure Blob (OCR, Growth+) ──────────────────────────

  @Post('presigned-url')
  @RequireFeature('ocr')
  @ApiOperation({
    summary: 'Generar URL pre-firmada para OCR (Growth+)',
    description:
      'Genera una URL de escritura temporal en Azure Blob Storage. ' +
      'El cliente sube el archivo directamente a Azure. Requiere plan Growth o superior.',
  })
  @ApiBody({ type: PresignedUrlDto })
  @ApiResponse({
    status: 201,
    description: 'URL pre-firmada generada',
    schema: { example: { uploadUrl: 'https://...blob.core...?sas=...', blobPath: 'ocr-documents/company123/uuid.jpg' } },
  })
  @ApiResponse({ status: 402, description: 'Plan Growth requerido' })
  getPresignedUrl(@Request() req, @Body() dto: PresignedUrlDto) {
    return this.uploadsService.generatePresignedUrl(
      req.user.companyId,
      dto.filename,
    );
  }

  // ── Direct screenshot upload (all plans) ─────────────────────────────────

  /**
   * File is held in memory (memoryStorage) and streamed directly to
   * Azure Blob Storage. No disk I/O on the server — safe for ephemeral
   * App Service instances.
   *
   * Returns { url: blobPath } — the blob path stored as Trip.screenshotUrl.
   * TripsService converts blob paths to SAS URLs when serving trip data.
   */
  @Post('screenshot')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('Only JPEG, PNG and WebP images are allowed'),
            false,
          );
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload trip screenshot',
    description:
      'Uploads a screenshot image (≤10 MB) to Azure Blob Storage. ' +
      'Returns the blob path stored on the trip record. Available on all plans.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Screenshot uploaded to Azure Blob Storage',
    schema: { example: { url: 'screenshots/company123/uuid.jpg' } },
  })
  @ApiResponse({ status: 400, description: 'No file provided or invalid type' })
  async uploadScreenshot(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const { blobPath } = await this.uploadsService.uploadScreenshot(
      req.user.companyId,
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    // Return as "url" to keep the API contract the same as before.
    // The value is now a blob path; TripsService converts it to a SAS URL.
    return { url: blobPath };
  }
}
