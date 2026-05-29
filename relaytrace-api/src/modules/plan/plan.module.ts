import { Module } from '@nestjs/common';
import { PlanService }  from './plan.service';
import { PlansModule }  from '../plans/plans.module';

@Module({
  imports:   [PlansModule],
  providers: [PlanService],
  exports:   [PlanService],
})
export class PlanModule {}
