import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrProcessor } from '../queue/processors/ocr.processor';

@Module({
  providers: [OcrService, OcrProcessor],
  exports: [OcrService],
})
export class OcrModule {}
