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
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class PresignedUrlDto {
  @ApiProperty({
    example: 'screenshot-trip-123.jpg',
    description: 'Nombre del archivo a subir',
  })
  @IsString()
  filename: string;
}

@ApiTags('Uploads')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presigned-url')
  @ApiOperation({
    summary: 'Generar URL pre-firmada',
    description:
      'Genera una URL de Azure Blob Storage para subir screenshots directamente desde el cliente.',
  })
  @ApiBody({ type: PresignedUrlDto })
  @ApiResponse({
    status: 201,
    description: 'URL pre-firmada generada',
    schema: {
      example: {
        url: 'https://storage.azure.com/...',
        blobName: 'company-id/uuid.jpg',
      },
    },
  })
  getPresignedUrl(@Request() req, @Body() dto: PresignedUrlDto) {
    return this.uploadsService.generatePresignedUrl(
      req.user.companyId,
      dto.filename,
    );
  }
}
