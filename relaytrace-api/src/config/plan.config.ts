// ─────────────────────────────────────────────────────────────────────────────
// Plan configuration — single source of truth for feature flags and limits.
// Keep in sync with the frontend mirror at relaytrace-web/src/config/plan.config.ts
// ─────────────────────────────────────────────────────────────────────────────

export type PlanName = 'starter' | 'growth' | 'fleet';

/**
 * Granular feature keys. Every protected endpoint declares exactly one feature.
 * Starter features are available on all plans (no guard needed for those).
 */
export type PlanFeature =
  // ── Starter (always available) ──────────────────────────────────────────
  | 'manual_trip'
  | 'pwa'
  | 'admin_dashboard'
  | 'audit_trail'
  // ── Growth (starter + these) ─────────────────────────────────────────────
  | 'ocr'
  | 'reconciliation'
  | 'anti_fraud'
  | 'dispatcher_role'
  // ── Fleet (growth + these) ───────────────────────────────────────────────
  | 'custom_integrations'
  | 'multi_account'
  | 'white_label';

export interface PlanDefinition {
  displayName: string;
  price: string;
  period: string;
  maxDrivers: number;        // max active DRIVER users; 0 = unlimited
  features: PlanFeature[];
}

export const PLAN_CONFIG: Record<PlanName, PlanDefinition> = {
  starter: {
    displayName: 'Starter',
    price: '$49',
    period: '/ month',
    maxDrivers: 5,
    features: ['manual_trip', 'pwa', 'admin_dashboard', 'audit_trail'],
  },
  growth: {
    displayName: 'Growth',
    price: '$149',
    period: '/ month',
    maxDrivers: 20,
    features: [
      'manual_trip', 'pwa', 'admin_dashboard', 'audit_trail',
      'ocr', 'reconciliation', 'anti_fraud', 'dispatcher_role',
    ],
  },
  fleet: {
    displayName: 'Fleet',
    price: 'Custom',
    period: '',
    maxDrivers: 0, // 0 = unlimited
    features: [
      'manual_trip', 'pwa', 'admin_dashboard', 'audit_trail',
      'ocr', 'reconciliation', 'anti_fraud', 'dispatcher_role',
      'custom_integrations', 'multi_account', 'white_label',
    ],
  },
};

/** Returns true when the plan has the feature. */
export function planHasFeature(plan: PlanName, feature: PlanFeature): boolean {
  return PLAN_CONFIG[plan]?.features.includes(feature) ?? false;
}

/** Returns effective driver limit (Infinity for 0 / fleet). */
export function driverLimit(plan: PlanName): number {
  const limit = PLAN_CONFIG[plan]?.maxDrivers ?? 5;
  return limit === 0 ? Infinity : limit;
}
