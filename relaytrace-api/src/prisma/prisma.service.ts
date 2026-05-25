/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/require-await */
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

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
