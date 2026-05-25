import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [tripsToday, activeDrivers, totalTrips, pendingAlerts] =
      await Promise.all([
        this.prisma.trip.count({
          where: { companyId, registeredAt: { gte: today } },
        }),
        this.prisma.user.count({
          where: {
            companyId,
            status: 'active',
            role: { name: 'DRIVER' },
          },
        }),
        this.prisma.trip.count({ where: { companyId } }),
        this.prisma.alert.count({
          where: { companyId, resolved: false },
        }),
      ]);

    return { tripsToday, activeDrivers, totalTrips, pendingAlerts };
  }

  async getActivity(companyId: string, limit = 10) {
    const recentTrips = await this.prisma.trip.findMany({
      where: { companyId },
      include: { driver: { select: { id: true, name: true, email: true } } },
      orderBy: { registeredAt: 'desc' },
      take: limit,
    });

    return { recentTrips };
  }
}
