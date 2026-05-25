import { Module } from '@nestjs/common';
import { ReconciliationController } from './reconciliation.controller';
import { ReconciliationService } from './reconciliation.service';
import { ReconcileProcessor } from '../queue/processors/reconcile.processor';

@Module({
  controllers: [ReconciliationController],
  providers: [ReconciliationService, ReconcileProcessor],
  exports: [ReconciliationService],
})
export class ReconciliationModule {}
