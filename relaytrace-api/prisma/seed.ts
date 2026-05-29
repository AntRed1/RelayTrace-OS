import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

function parseMysqlUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '3306'),
    user: parsed.username,
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace('/', ''),
    connectionLimit: 10,
    allowPublicKeyRetrieval: true,
  };
}

const adapter = new PrismaMariaDb(
  parseMysqlUrl(process.env.DATABASE_URL as string),
);
const prisma = new PrismaClient({ adapter });

// ─── Plan seed data ───────────────────────────────────────────────────────────

interface PlanSeed {
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

const PLAN_SEEDS: PlanSeed[] = [
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
      'manual_trip', 'pwa', 'admin_dashboard', 'audit_trail',
      'ocr', 'reconciliation', 'anti_fraud', 'dispatcher_role',
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
      'manual_trip', 'pwa', 'admin_dashboard', 'audit_trail',
      'ocr', 'reconciliation', 'anti_fraud', 'dispatcher_role',
      'custom_integrations', 'multi_account', 'white_label',
    ],
    isPopular: false,
    sortOrder: 3,
    ctaLabel: 'Contact Sales',
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const roles = [
    { name: 'SUPER_ADMIN', permissions: JSON.stringify(['manage:all']) },
    {
      name: 'COMPANY_ADMIN',
      permissions: JSON.stringify(['manage:users', 'read:trips']),
    },
    {
      name: 'DISPATCHER',
      permissions: JSON.stringify(['read:trips', 'read:drivers']),
    },
    {
      name: 'DRIVER',
      permissions: JSON.stringify(['write:trips', 'read:trips:own']),
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  const company = await prisma.company.upsert({
    where: { email: 'admin@relaytrace.com' },
    update: {},
    create: {
      name: 'RelayTrace Admin',
      email: 'admin@relaytrace.com',
      subscriptionStatus: 'active',
    },
  });

  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'SUPER_ADMIN' },
  });

  const passwordHash = await bcrypt.hash('@Emulador1', 10);

  await prisma.user.upsert({
    where: { email: 'admin@relaytrace.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@relaytrace.com',
      passwordHash,
      companyId: company.id,
      roleId: superAdminRole!.id,
      status: 'active',
    },
  });

  // ── Plans ────────────────────────────────────────────────────────────────
  for (const plan of PLAN_SEEDS) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        displayName:   plan.displayName,
        description:   plan.description,
        priceMonthly:  plan.priceMonthly,
        maxDrivers:    plan.maxDrivers,
        featureLabels: JSON.stringify(plan.featureLabels),
        featureFlags:  JSON.stringify(plan.featureFlags),
        isPopular:     plan.isPopular,
        sortOrder:     plan.sortOrder,
        ctaLabel:      plan.ctaLabel,
      },
      create: {
        slug:          plan.slug,
        displayName:   plan.displayName,
        description:   plan.description,
        priceMonthly:  plan.priceMonthly,
        maxDrivers:    plan.maxDrivers,
        featureLabels: JSON.stringify(plan.featureLabels),
        featureFlags:  JSON.stringify(plan.featureFlags),
        isActive:      true,
        isPopular:     plan.isPopular,
        sortOrder:     plan.sortOrder,
        ctaLabel:      plan.ctaLabel,
        currency:      'USD',
      },
    });
  }

  console.log('✅ Seed completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
