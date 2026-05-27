import { Module } from '@nestjs/common';
import { ReconciliationController } from './reconciliation.controller';
import { ReconciliationService } from './reconciliation.service';
import { ReconcileProcessor } from '../queue/processors/reconcile.processor';
import { PlanModule } from '../plan/plan.module';

@Module({
  imports: [PlanModule],
  controllers: [ReconciliationController],
  providers: [ReconciliationService, ReconcileProcessor],
  exports: [ReconciliationService],
})
export class ReconciliationModule {}
