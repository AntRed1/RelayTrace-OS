/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/require-await */
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

function parseMysqlUrl(url: string) {
  const parsed = new URL(url);
  // Azure MySQL Flexible Server requires SSL. The DATABASE_URL carries
  // ?sslaccept=strict but the mariadb driver doesn't read URL params —
  // we must forward SSL explicitly or the connection times out after ~30 s.
  const requireSsl =
    parsed.searchParams.get('sslaccept') === 'strict' ||
    parsed.searchParams.get('ssl') === 'true' ||
    parsed.hostname.includes('.mysql.database.azure.com');
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '3306'),
    user: parsed.username,
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace('/', ''),
    connectionLimit: 10,
    allowPublicKeyRetrieval: true,
    ...(requireSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaMariaDb(
      parseMysqlUrl(process.env.DATABASE_URL as string),
    );
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('SIGINT', async () => {
      await this.$disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.$disconnect();
      process.exit(0);
    });
  }
}
