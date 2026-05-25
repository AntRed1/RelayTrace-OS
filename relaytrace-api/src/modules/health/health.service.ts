import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'connected',
        database: 'MySQL',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new ServiceUnavailableException('Database connection failed');
    }
  }
}
