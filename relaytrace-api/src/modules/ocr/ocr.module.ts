import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrProcessor } from '../queue/processors/ocr.processor';
import { AzureBlobModule } from '../../common/azure-blob/azure-blob.module';

@Module({
  imports: [AzureBlobModule],
  providers: [OcrService, OcrProcessor],
  exports: [OcrService],
})
export class OcrModule {}
