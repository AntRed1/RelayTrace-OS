import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { PlanModule } from '../plan/plan.module';
import { AzureBlobModule } from '../../common/azure-blob/azure-blob.module';

@Module({
  imports: [PlanModule, AzureBlobModule],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
