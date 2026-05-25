import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResourceNotFoundException } from '../../common/exceptions/custom.exceptions';

const USER_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  status: true,
  companyId: true,
  roleId: true,
  createdAt: true,
  updatedAt: true,
  role: true,
};

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [drivers, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { companyId, role: { name: 'DRIVER' } },
        select: USER_SAFE_SELECT,
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: { companyId, role: { name: 'DRIVER' } },
      }),
    ]);

    return {
      data: drivers,
      meta: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDriverStats(driverId: string, companyId: string) {
    const driver = await this.prisma.user.findFirst({
      where: { id: driverId, companyId, role: { name: 'DRIVER' } },
      select: USER_SAFE_SELECT,
    });

    if (!driver) {
      throw new ResourceNotFoundException('Driver', driverId);
    }

    const [tripStats, totalTrips] = await Promise.all([
      this.prisma.trip.groupBy({
        by: ['status'],
        where: { driverId },
        _count: true,
      }),
      this.prisma.trip.count({ where: { driverId } }),
    ]);

    return { driver, tripStats, totalTrips };
  }
}
