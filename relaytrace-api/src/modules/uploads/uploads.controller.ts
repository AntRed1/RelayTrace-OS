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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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

// ─── Multer disk storage for local screenshots ─────────────────────────────

const screenshotsDir = join(process.cwd(), 'public', 'screenshots');

function ensureScreenshotsDir() {
  if (!existsSync(screenshotsDir)) {
    mkdirSync(screenshotsDir, { recursive: true });
  }
}

const screenshotStorage = diskStorage({
  destination: (_req, _file, cb) => {
    ensureScreenshotsDir();
    cb(null, screenshotsDir);
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${randomUUID()}${ext}`);
  },
});

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── Controller ────────────────────────────────────────────────────────────

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

  // ── Direct screenshot upload (all plans, all authenticated users) ─────────

  @Post('screenshot')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: screenshotStorage,
      limits: { fileSize: MAX_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only JPEG, PNG and WebP images are allowed'), false);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload trip screenshot',
    description: 'Uploads a screenshot image (≤10 MB). Returns a public URL. Available on all plans.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Screenshot uploaded', schema: { example: { url: '/screenshots/uuid.jpg' } } })
  @ApiResponse({ status: 400, description: 'No file provided or invalid type' })
  uploadScreenshot(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return { url: `/screenshots/${file.filename}` };
  }
}
