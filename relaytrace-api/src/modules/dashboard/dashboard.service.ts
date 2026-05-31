import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(companyId: string | null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // companyId=null → SUPER_ADMIN ve métricas globales de todas las empresas
    const base = companyId ? { companyId } : {};

    const [tripsToday, activeDrivers, totalTrips, pendingAlerts] =
      await Promise.all([
        this.prisma.trip.count({
          where: { ...base, registeredAt: { gte: today } },
        }),
        this.prisma.user.count({
          where: {
            ...base,
            status: 'active',
            role: { name: 'DRIVER' },
          },
        }),
        this.prisma.trip.count({ where: base }),
        this.prisma.alert.count({
          where: { ...base, resolved: false },
        }),
      ]);

    return { tripsToday, activeDrivers, totalTrips, pendingAlerts };
  }

  async getActivity(companyId: string | null, limit = 10) {
    const where = companyId ? { companyId } : {};

    const recentTrips = await this.prisma.trip.findMany({
      where,
      include: {
        driver: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { registeredAt: 'desc' },
      take: limit,
    });

    return { recentTrips };
  }

  async getAlerts(companyId: string | null, limit = 20) {
    const where = {
      ...(companyId ? { companyId } : {}),
      resolved: false,
    };

    const alerts = await this.prisma.alert.findMany({
      where,
      include: {
        trip: { select: { id: true, tripId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return alerts;
  }

  async resolveAlert(alertId: string, companyId: string | null) {
    return this.prisma.alert.update({
      where: {
        id: alertId,
        ...(companyId ? { companyId } : {}),
      },
      data: { resolved: true },
    });
  }

  async getMapPoints(companyId: string | null, limit = 50) {
    const where = {
      ...(companyId ? { companyId } : {}),
      latitude:  { not: null },
      longitude: { not: null },
    };

    return this.prisma.trip.findMany({
      where,
      select: {
        id:           true,
        tripId:       true,
        latitude:     true,
        longitude:    true,
        registeredAt: true,
        driver: { select: { name: true } },
      },
      orderBy: { registeredAt: 'desc' },
      take: limit,
    });
  }
}
