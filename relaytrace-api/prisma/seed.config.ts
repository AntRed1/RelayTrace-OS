/**
 * Seed configuration — role & plan definitions.
 * These are master data that define the product itself, not instance-specific.
 */

export const ROLE_SEEDS = [
  {
    name: 'SUPER_ADMIN',
    permissions: JSON.stringify(['manage:all']),
  },
  {
    name: 'COMPANY_ADMIN',
    permissions: JSON.stringify(['manage:users', 'read:trips', 'write:trips']),
  },
  {
    name: 'DISPATCHER',
    permissions: JSON.stringify(['read:trips', 'read:drivers', 'write:alerts']),
  },
  {
    name: 'DRIVER',
    permissions: JSON.stringify(['write:trips', 'read:trips:own']),
  },
];

export interface PlanSeedData {
  slug: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  maxDrivers: number | null;
  featureLabels: string[];
  featureFlags: string[];
  isPopular: boolean;
  sortOrder: number;
  ctaLabel: string;
}

export const PLAN_SEEDS: PlanSeedData[] = [
  {
    slug: 'starter',
    displayName: 'Starter',
    description: 'Perfect for small carriers just getting started.',
    priceMonthly: 49,
    maxDrivers: 5,
    featureLabels: [
      'Manual trip registration',
      'Driver mobile PWA',
      'Admin dashboard',
      'Basic audit trail',
      'Email support',
    ],
    featureFlags: ['manual_trip', 'pwa', 'admin_dashboard', 'audit_trail'],
    isPopular: false,
    sortOrder: 1,
    ctaLabel: 'Get Started',
  },
  {
    slug: 'growth',
    displayName: 'Growth',
    description: 'For growing operations that need automation.',
    priceMonthly: 149,
    maxDrivers: 20,
    featureLabels: [
      'Everything in Starter',
      'OCR screenshot → Trip ID',
      'Email reconciliation engine',
      'Anti-fraud alerts',
      'Dispatcher role',
      'Priority support',
    ],
    featureFlags: [
      'manual_trip',
      'pwa',
      'admin_dashboard',
      'audit_trail',
      'ocr',
      'reconciliation',
      'anti_fraud',
      'dispatcher_role',
    ],
    isPopular: true,
    sortOrder: 2,
    ctaLabel: 'Get Started',
  },
  {
    slug: 'fleet',
    displayName: 'Fleet',
    description: 'For large fleets with enterprise requirements.',
    priceMonthly: 0, // custom pricing — contact sales
    maxDrivers: null,
    featureLabels: [
      'Everything in Growth',
      'Custom integrations',
      'Multi-account Relay support',
      'SLA guarantee',
      'Dedicated onboarding',
      'White-label option',
    ],
    featureFlags: [
      'manual_trip',
      'pwa',
      'admin_dashboard',
      'audit_trail',
      'ocr',
      'reconciliation',
      'anti_fraud',
      'dispatcher_role',
      'custom_integrations',
      'multi_account',
      'white_label',
    ],
    isPopular: false,
    sortOrder: 3,
    ctaLabel: 'Contact Sales',
  },
];
