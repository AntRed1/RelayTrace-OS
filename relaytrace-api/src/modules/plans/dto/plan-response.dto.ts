// Raw shape returned by Prisma (priceMonthly is a Prisma.Decimal — serialise via Number())
interface PlanRecord {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  priceMonthly: { toNumber(): number } | number;
  currency: string;
  maxDrivers: number | null;
  featureLabels: string;
  featureFlags: string;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  ctaLabel: string;
  stripePriceId: string | null;
  stripeProductId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Full plan response (admin endpoints — includes Stripe IDs and all fields). */
export interface PlanResponse {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  currency: string;
  maxDrivers: number | null;
  featureLabels: string[];
  featureFlags: string[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  ctaLabel: string;
  stripePriceId: string | null;
  stripeProductId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Minimal shape exposed on the public /plans endpoint (no Stripe IDs). */
export interface PublicPlanResponse {
  slug: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  currency: string;
  maxDrivers: number | null;
  featureLabels: string[];
  isPopular: boolean;
  ctaLabel: string;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function toFullResponse(plan: PlanRecord): PlanResponse {
  return {
    id:             plan.id,
    slug:           plan.slug,
    displayName:    plan.displayName,
    description:    plan.description,
    priceMonthly:   Number(plan.priceMonthly),
    currency:       plan.currency,
    maxDrivers:     plan.maxDrivers,
    featureLabels:  JSON.parse(plan.featureLabels) as string[],
    featureFlags:   JSON.parse(plan.featureFlags)  as string[],
    isActive:       plan.isActive,
    isPopular:      plan.isPopular,
    sortOrder:      plan.sortOrder,
    ctaLabel:       plan.ctaLabel,
    stripePriceId:  plan.stripePriceId,
    stripeProductId: plan.stripeProductId,
    createdAt:      plan.createdAt.toISOString(),
    updatedAt:      plan.updatedAt.toISOString(),
  };
}

export function toPublicResponse(plan: PlanRecord): PublicPlanResponse {
  return {
    slug:          plan.slug,
    displayName:   plan.displayName,
    description:   plan.description,
    priceMonthly:  Number(plan.priceMonthly),
    currency:      plan.currency,
    maxDrivers:    plan.maxDrivers,
    featureLabels: JSON.parse(plan.featureLabels) as string[],
    isPopular:     plan.isPopular,
    ctaLabel:      plan.ctaLabel,
  };
}
