import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PLAN_CONFIG,
  PlanFeature,
  PlanName,
  driverLimit,
  planHasFeature,
} from '../../config/plan.config';
import {
  FeatureNotAvailableException,
  PlanLimitExceededException,
  ResourceNotFoundException,
} from '../../common/exceptions/custom.exceptions';

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  // ─── Core lookups ─────────────────────────────────────────────────────────

  async getCompanyPlan(companyId: string): Promise<PlanName> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { plan: true },
    });
    if (!company) throw new ResourceNotFoundException('Company', companyId);
    return (company.plan as PlanName) ?? 'starter';
  }

  async getActiveDriverCount(companyId: string): Promise<number> {
    const driverRole = await this.prisma.role.findUnique({
      where: { name: 'DRIVER' },
      select: { id: true },
    });
    if (!driverRole) return 0;

    return this.prisma.user.count({
      where: { companyId, roleId: driverRole.id, status: 'active' },
    });
  }

  // ─── Assertions (throw on violation) ─────────────────────────────────────

  async assertFeature(companyId: string, feature: PlanFeature): Promise<void> {
    const plan = await this.getCompanyPlan(companyId);
    if (!planHasFeature(plan, feature)) {
      throw new FeatureNotAvailableException(feature, plan);
    }
  }

  async assertDriverLimit(companyId: string): Promise<void> {
    const plan = await this.getCompanyPlan(companyId);
    const limit = driverLimit(plan);
    if (limit === Infinity) return; // fleet: no limit

    const current = await this.getActiveDriverCount(companyId);
    if (current >= limit) {
      throw new PlanLimitExceededException('conductores', current, limit, plan);
    }
  }

  // ─── Plan info (for settings / onboarding UI) ─────────────────────────────

  async getPlanInfo(companyId: string) {
    const plan = await this.getCompanyPlan(companyId);
    const config = PLAN_CONFIG[plan];
    const currentDrivers = await this.getActiveDriverCount(companyId);
    const maxDrivers = driverLimit(plan);

    return {
      plan,
      displayName: config.displayName,
      price: config.price,
      period: config.period,
      maxDrivers: maxDrivers === Infinity ? null : maxDrivers,
      currentDrivers,
      driverSlotsRemaining:
        maxDrivers === Infinity ? null : Math.max(0, maxDrivers - currentDrivers),
      features: config.features,
    };
  }

  // ─── SUPER_ADMIN: change plan ─────────────────────────────────────────────

  async updatePlan(companyId: string, plan: PlanName) {
    await this.prisma.company.update({
      where: { id: companyId },
      data: { plan },
    });
    return this.getPlanInfo(companyId);
  }
}
