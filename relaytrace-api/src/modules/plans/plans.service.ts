import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { PrismaService }  from '../../prisma/prisma.service';
import { CacheService }   from '../../common/cache/cache.service';
import { AuditService, AuditActor } from '../audit/audit.service';
import { CreatePlanDto }  from './dto/create-plan.dto';
import { UpdatePlanDto }  from './dto/update-plan.dto';
import {
  PlanResponse,
  PublicPlanResponse,
  toFullResponse,
  toPublicResponse,
} from './dto/plan-response.dto';
import {
  PLANS_LIST_CACHE_KEY,
  PLANS_CACHE_PATTERN,
  PLANS_CACHE_TTL_MS,
  planSlugCacheKey,
} from './plans.constants';

@Injectable()
export class PlansService {
  private readonly logger  = new Logger(PlansService.name);
  private readonly stripe: InstanceType<typeof Stripe> | null;

  constructor(
    private readonly prisma:  PrismaService,
    private readonly cache:   CacheService,
    private readonly config:  ConfigService,
    private readonly audit:   AuditService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = key ? new Stripe(key) : null;
  }

  // =========================================================================
  // Public read (landing page — cached)
  // =========================================================================

  /** Returns active plans ordered by sortOrder. Cached for 5 min. */
  async findAllPublic(): Promise<PublicPlanResponse[]> {
    return this.cache.getOrSet(
      PLANS_LIST_CACHE_KEY,
      async () => {
        const plans = await this.prisma.plan.findMany({
          where:   { isActive: true },
          orderBy: { sortOrder: 'asc' },
        });
        return plans.map(toPublicResponse);
      },
      PLANS_CACHE_TTL_MS,
    );
  }

  // =========================================================================
  // Admin read (no cache — SUPER_ADMIN needs fresh data)
  // =========================================================================

  async findAll(): Promise<PlanResponse[]> {
    const plans = await this.prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return plans.map(toFullResponse);
  }

  async findById(id: string): Promise<PlanResponse> {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan "${id}" not found`);
    return toFullResponse(plan);
  }

  /**
   * Finds a plan by slug with caching.
   * Used by PlanService (PlanGuard) and BillingService — must be fast.
   */
  async findBySlug(slug: string): Promise<PlanResponse> {
    return this.cache.getOrSet(
      planSlugCacheKey(slug),
      async () => {
        const plan = await this.prisma.plan.findUnique({ where: { slug } });
        if (!plan) throw new NotFoundException(`Plan "${slug}" not found`);
        return toFullResponse(plan);
      },
      PLANS_CACHE_TTL_MS,
    );
  }

  // =========================================================================
  // Create
  // =========================================================================

  async create(dto: CreatePlanDto, actor?: AuditActor): Promise<PlanResponse> {
    const existing = await this.prisma.plan.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Plan with slug "${dto.slug}" already exists`);

    const stripeIds = await this.provisionStripeProductAndPrice(
      dto.slug, dto.displayName, dto.priceMonthly, dto.currency ?? 'USD',
    );

    const plan = await this.prisma.plan.create({
      data: {
        slug:            dto.slug,
        displayName:     dto.displayName,
        description:     dto.description,
        priceMonthly:    dto.priceMonthly,
        currency:        dto.currency   ?? 'USD',
        maxDrivers:      dto.maxDrivers ?? null,
        featureLabels:   JSON.stringify(dto.featureLabels),
        featureFlags:    JSON.stringify(dto.featureFlags),
        isActive:        dto.isActive   ?? true,
        isPopular:       dto.isPopular  ?? false,
        sortOrder:       dto.sortOrder  ?? 0,
        ctaLabel:        dto.ctaLabel   ?? 'Get Started',
        stripeProductId: stripeIds?.productId ?? null,
        stripePriceId:   stripeIds?.priceId   ?? null,
      },
    });

    await this.invalidateCache();

    if (actor) {
      await this.audit.log({
        action:   'create_plan',
        actor,
        metadata: { planId: plan.id, slug: plan.slug, displayName: plan.displayName },
      });
    }

    return toFullResponse(plan);
  }

  // =========================================================================
  // Update
  // =========================================================================

  async update(id: string, dto: UpdatePlanDto, actor?: AuditActor): Promise<PlanResponse> {
    const existing = await this.prisma.plan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Plan "${id}" not found`);

    // Sync price with Stripe when priceMonthly changes
    let newStripePriceId = existing.stripePriceId;
    const priceChanged =
      dto.priceMonthly !== undefined &&
      Number(dto.priceMonthly) !== Number(existing.priceMonthly);

    if (priceChanged && existing.stripeProductId) {
      newStripePriceId = await this.createStripePrice(
        existing.stripeProductId,
        dto.priceMonthly!,
        dto.currency ?? existing.currency,
        existing.stripePriceId ?? undefined,
      );
    }

    const plan = await this.prisma.plan.update({
      where: { id },
      data: {
        ...(dto.displayName   !== undefined && { displayName:   dto.displayName   }),
        ...(dto.description   !== undefined && { description:   dto.description   }),
        ...(dto.priceMonthly  !== undefined && { priceMonthly:  dto.priceMonthly  }),
        ...(dto.currency      !== undefined && { currency:      dto.currency      }),
        ...(dto.maxDrivers    !== undefined && { maxDrivers:    dto.maxDrivers    }),
        ...(dto.featureLabels !== undefined && { featureLabels: JSON.stringify(dto.featureLabels) }),
        ...(dto.featureFlags  !== undefined && { featureFlags:  JSON.stringify(dto.featureFlags)  }),
        ...(dto.isActive      !== undefined && { isActive:      dto.isActive      }),
        ...(dto.isPopular     !== undefined && { isPopular:     dto.isPopular     }),
        ...(dto.sortOrder     !== undefined && { sortOrder:     dto.sortOrder     }),
        ...(dto.ctaLabel      !== undefined && { ctaLabel:      dto.ctaLabel      }),
        stripePriceId: newStripePriceId,
      },
    });

    await this.invalidateCache();

    if (actor) {
      await this.audit.log({
        action:   'update_plan',
        actor,
        metadata: { planId: id, changes: dto, priceChanged },
      });
    }

    return toFullResponse(plan);
  }

  // =========================================================================
  // Delete (soft — sets isActive = false; hard delete also supported)
  // =========================================================================

  async remove(id: string, actor?: AuditActor): Promise<void> {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan "${id}" not found`);

    // Soft-delete: deactivate so existing companies retain their slug reference
    await this.prisma.plan.update({ where: { id }, data: { isActive: false } });

    await this.invalidateCache();

    if (actor) {
      await this.audit.log({
        action:   'delete_plan',
        actor,
        metadata: { planId: id, slug: plan.slug, displayName: plan.displayName },
      });
    }
  }

  // =========================================================================
  // Cache invalidation
  // =========================================================================

  /** Wipes all plan cache keys. Called after any write operation. */
  async invalidateCache(): Promise<void> {
    await this.cache.delByPattern(PLANS_CACHE_PATTERN);
    this.logger.debug('Plan cache invalidated');
  }

  // =========================================================================
  // Stripe helpers (non-fatal — errors are logged, not thrown)
  // =========================================================================

  private async provisionStripeProductAndPrice(
    slug: string,
    name: string,
    priceMonthly: number,
    currency: string,
  ): Promise<{ productId: string; priceId: string } | null> {
    if (!this.stripe || priceMonthly === 0) return null;

    try {
      const product = await this.stripe.products.create({
        name,
        metadata: { slug },
      });

      const price = await this.stripe.prices.create({
        product:     product.id,
        unit_amount: Math.round(priceMonthly * 100),
        currency:    currency.toLowerCase(),
        recurring:   { interval: 'month' },
      });

      this.logger.log(`Stripe product+price created for plan "${slug}": ${price.id}`);
      return { productId: product.id, priceId: price.id };
    } catch (err) {
      this.logger.error(`Stripe provisioning failed for "${slug}": ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Creates a new Stripe Price on the existing Product (prices are immutable).
   * Optionally archives the previous price to keep the Stripe dashboard clean.
   */
  private async createStripePrice(
    productId: string,
    priceMonthly: number,
    currency: string,
    oldPriceId?: string,
  ): Promise<string | null> {
    if (!this.stripe || priceMonthly === 0) return null;

    try {
      const price = await this.stripe.prices.create({
        product:     productId,
        unit_amount: Math.round(priceMonthly * 100),
        currency:    currency.toLowerCase(),
        recurring:   { interval: 'month' },
      });

      // Archive the old price so Stripe stays clean
      if (oldPriceId) {
        await this.stripe.prices
          .update(oldPriceId, { active: false })
          .catch((e: Error) => this.logger.warn(`Could not archive old price ${oldPriceId}: ${e.message}`));
      }

      this.logger.log(`New Stripe price created: ${price.id} ($${priceMonthly}/${currency})`);
      return price.id;
    } catch (err) {
      this.logger.error(`Stripe price update failed: ${(err as Error).message}`);
      return null;
    }
  }
}
