import { Injectable } from '@nestjs/common';
import { PrismaService }  from '../../prisma/prisma.service';
import { PlansService }   from '../plans/plans.service';
import { PlanFeature }    from '../../config/plan.config';
import {
  FeatureNotAvailableException,
  PlanLimitExceededException,
  ResourceNotFoundException,
} from '../../common/exceptions/custom.exceptions';

/**
 * Runtime plan enforcement service.
 *
 * Resolves plan definitions dynamically from the DB (via PlansService,
 * which applies Redis caching). No more static PLAN_CONFIG imports here —
 * plan.config.ts is retained only as the TypeScript source of truth for
 * feature key names.
 */
@Injectable()
export class PlanService {
  constructor(
    private readonly prisma:  PrismaService,
    private readonly plans:   PlansService,
  ) {}

  // ─── Core lookups ─────────────────────────────────────────────────────────

  async getCompanyPlanSlug(companyId: string): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where:  { id: companyId },
      select: { plan: true },
    });
    if (!company) throw new ResourceNotFoundException('Company', companyId);
    return company.plan ?? 'starter';
  }

  async getActiveDriverCount(companyId: string): Promise<number> {
    const driverRole = await this.prisma.role.findUnique({
      where:  { name: 'DRIVER' },
      select: { id: true },
    });
    if (!driverRole) return 0;

    return this.prisma.user.count({
      where: { companyId, roleId: driverRole.id, status: 'active' },
    });
  }

  // ─── Assertions (throw on violation) ─────────────────────────────────────

  async assertFeature(companyId: string, feature: PlanFeature): Promise<void> {
    const slug    = await this.getCompanyPlanSlug(companyId);
    const planDef = await this.plans.findBySlug(slug); // cached
    const flags   = planDef.featureFlags as PlanFeature[];

    if (!flags.includes(feature)) {
      throw new FeatureNotAvailableException(feature, slug);
    }
  }

  async assertDriverLimit(companyId: string): Promise<void> {
    const slug    = await this.getCompanyPlanSlug(companyId);
    const planDef = await this.plans.findBySlug(slug); // cached

    if (planDef.maxDrivers === null) return; // unlimited (fleet)

    const current = await this.getActiveDriverCount(companyId);
    if (current >= planDef.maxDrivers) {
      throw new PlanLimitExceededException(
        'conductores',
        current,
        planDef.maxDrivers,
        slug,
      );
    }
  }

  // ─── Plan info (settings / onboarding UI) ────────────────────────────────

  async getPlanInfo(companyId: string) {
    const slug       = await this.getCompanyPlanSlug(companyId);
    const planDef    = await this.plans.findBySlug(slug); // cached
    const current    = await this.getActiveDriverCount(companyId);
    const maxDrivers = planDef.maxDrivers;

    return {
      plan:                 slug,
      displayName:          planDef.displayName,
      price:                planDef.priceMonthly === 0 ? 'Custom' : `$${planDef.priceMonthly}`,
      period:               planDef.priceMonthly === 0 ? '' : '/ month',
      maxDrivers:           maxDrivers,
      currentDrivers:       current,
      driverSlotsRemaining: maxDrivers === null ? null : Math.max(0, maxDrivers - current),
      features:             planDef.featureFlags,
    };
  }

  // ─── SUPER_ADMIN: change plan ─────────────────────────────────────────────

  async updatePlan(companyId: string, slug: string) {
    // Verify the target plan exists before updating
    await this.plans.findBySlug(slug);

    await this.prisma.company.update({
      where: { id: companyId },
      data:  { plan: slug },
    });
    return this.getPlanInfo(companyId);
  }
}
