import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { AuditModule } from '../audit/audit.module';
import { AzureBlobModule } from '../../common/azure-blob/azure-blob.module';

@Module({
  imports: [AuditModule, AzureBlobModule],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
