import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import { ROLE_SEEDS, PLAN_SEEDS } from './seed.config';

// ─── Database connection ──────────────────────────────────────────────────────

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

// ─── Seed configuration from environment ──────────────────────────────────────

interface SeedConfig {
  // Initial admin company (required)
  SEED_COMPANY_NAME: string;
  SEED_COMPANY_EMAIL: string;

  // Initial admin user (required)
  SEED_ADMIN_NAME: string;
  SEED_ADMIN_EMAIL: string;
  SEED_ADMIN_PASSWORD: string; // ⚠️  INSECURE — only for dev. Change immediately in prod.
}

function getSeedConfig(): SeedConfig {
  const config: SeedConfig = {
    SEED_COMPANY_NAME:   process.env.SEED_COMPANY_NAME   ?? 'RelayTrace Admin',
    SEED_COMPANY_EMAIL:  process.env.SEED_COMPANY_EMAIL  ?? 'admin@relaytrace.local',
    SEED_ADMIN_NAME:     process.env.SEED_ADMIN_NAME     ?? 'Super Admin',
    SEED_ADMIN_EMAIL:    process.env.SEED_ADMIN_EMAIL    ?? 'admin@relaytrace.local',
    SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD ?? '@Emulador1', // ⚠️  DEV ONLY
  };

  // Warn if using default passwords in production
  if (process.env.NODE_ENV === 'production') {
    if (config.SEED_ADMIN_PASSWORD === '@Emulador1') {
      console.warn(
        '⚠️  WARNING: Using default admin password in production! ' +
        'Set SEED_ADMIN_PASSWORD environment variable immediately.',
      );
    }
  }

  return config;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const config = getSeedConfig();

  console.log('🌱 Seeding database...');
  console.log(`   Company: ${config.SEED_COMPANY_NAME} (${config.SEED_COMPANY_EMAIL})`);
  console.log(`   Admin:   ${config.SEED_ADMIN_NAME} (${config.SEED_ADMIN_EMAIL})`);
  console.log('');

  // ── Roles ────────────────────────────────────────────────────────────────
  console.log('📋 Seeding roles...');
  for (const role of ROLE_SEEDS) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // ── Company ──────────────────────────────────────────────────────────────
  console.log('🏢 Seeding company...');
  const company = await prisma.company.upsert({
    where: { email: config.SEED_COMPANY_EMAIL },
    update: {
      name: config.SEED_COMPANY_NAME,
    },
    create: {
      name: config.SEED_COMPANY_NAME,
      email: config.SEED_COMPANY_EMAIL,
      subscriptionStatus: 'active',
      plan: 'fleet', // seed gives admins full access
    },
  });

  // ── Super Admin User ─────────────────────────────────────────────────────
  console.log('👤 Seeding admin user...');
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'SUPER_ADMIN' },
  });

  const passwordHash = await bcrypt.hash(config.SEED_ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: config.SEED_ADMIN_EMAIL },
    update: {
      name: config.SEED_ADMIN_NAME,
    },
    create: {
      name: config.SEED_ADMIN_NAME,
      email: config.SEED_ADMIN_EMAIL,
      passwordHash,
      companyId: company.id,
      roleId: superAdminRole!.id,
      status: 'active',
    },
  });

  // ── Plans (master data) ──────────────────────────────────────────────────
  console.log('💰 Seeding pricing plans...');
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

  console.log('');
  console.log('✅ Seed completed!');
  console.log('');
  console.log('🔐 IMPORTANT (Development Only):');
  console.log(`   Email:    ${config.SEED_ADMIN_EMAIL}`);
  console.log(`   Password: ${config.SEED_ADMIN_PASSWORD}`);
  console.log('');
  console.log('   ⚠️  Change these credentials immediately in production!');
  console.log('   ⚠️  Set environment variables: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD');
  console.log('');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
