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

  console.log('✅ Seed completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
