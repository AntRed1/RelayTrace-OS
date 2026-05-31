// ─────────────────────────────────────────────────────────────────────────────
// Plan configuration — mirror of relaytrace-api/src/config/plan.config.ts
// Keep both files in sync when changing plan definitions.
// ─────────────────────────────────────────────────────────────────────────────

export type PlanName = 'starter' | 'growth' | 'fleet';

export type PlanFeature =
  | 'manual_trip'
  | 'pwa'
  | 'admin_dashboard'
  | 'audit_trail'
  | 'ocr'
  | 'reconciliation'
  | 'anti_fraud'
  | 'dispatcher_role'
  | 'custom_integrations'
  | 'multi_account'
  | 'white_label';

export interface PlanDefinition {
  displayName: string;
  price: string;
  period: string;
  maxDrivers: number;   // 0 = unlimited
  features: PlanFeature[];
  color: string;        // accent color for UI
}

export const PLAN_CONFIG: Record<PlanName, PlanDefinition> = {
  starter: {
    displayName: 'Starter',
    price: '$49',
    period: '/ month',
    maxDrivers: 5,
    color: '#64748b',
    features: ['manual_trip', 'pwa', 'admin_dashboard', 'audit_trail'],
  },
  growth: {
    displayName: 'Growth',
    price: '$149',
    period: '/ month',
    maxDrivers: 20,
    color: '#2563eb',
    features: [
      'manual_trip', 'pwa', 'admin_dashboard', 'audit_trail',
      'ocr', 'reconciliation', 'anti_fraud', 'dispatcher_role',
    ],
  },
  fleet: {
    displayName: 'Fleet',
    price: 'Custom',
    period: '',
    maxDrivers: 0,
    color: '#7c3aed',
    features: [
      'manual_trip', 'pwa', 'admin_dashboard', 'audit_trail',
      'ocr', 'reconciliation', 'anti_fraud', 'dispatcher_role',
      'custom_integrations', 'multi_account', 'white_label',
    ],
  },
};

export const FEATURE_LABELS: Record<PlanFeature, string> = {
  manual_trip:          'Manual trip registration',
  pwa:                  'Driver mobile app (PWA)',
  admin_dashboard:      'Admin dashboard',
  audit_trail:          'Audit trail',
  ocr:                  'OCR: auto-extract Trip ID from photo',
  reconciliation:       'Relay email reconciliation engine',
  anti_fraud:           'Real-time anti-fraud alerts',
  dispatcher_role:      'Dispatcher role',
  custom_integrations:  'Custom integrations',
  multi_account:        'Multi-account Relay support',
  white_label:          'White-label',
};

/** The plan that first introduces a feature (for upgrade prompts). */
export const FEATURE_MIN_PLAN: Record<PlanFeature, PlanName> = {
  manual_trip:          'starter',
  pwa:                  'starter',
  admin_dashboard:      'starter',
  audit_trail:          'starter',
  ocr:                  'growth',
  reconciliation:       'growth',
  anti_fraud:           'growth',
  dispatcher_role:      'growth',
  custom_integrations:  'fleet',
  multi_account:        'fleet',
  white_label:          'fleet',
};

export function planHasFeature(plan: PlanName, feature: PlanFeature): boolean {
  return PLAN_CONFIG[plan]?.features.includes(feature) ?? false;
}

export function driverLimit(plan: PlanName): number | null {
  const limit = PLAN_CONFIG[plan]?.maxDrivers ?? 5;
  return limit === 0 ? null : limit;
}
