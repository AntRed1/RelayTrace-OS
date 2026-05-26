/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto, UpdateTripDto, TripFilterDto } from './dto/trips.dtos';
import {
  ResourceNotFoundException,
  ConflictException,
} from '../../common/exceptions/custom.exceptions';
import { QueueProducerService } from '../queue/queue-producer.service';
import { RequestUser } from '../../common/types/user.types';
import { AuditService } from '../audit/audit.service';

const DRIVER_SELECT = {
  id: true,
  name: true,
  email: true,
  status: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
};

@Injectable()
export class TripsService {
  constructor(
    private prisma: PrismaService,
    private queueProducer: QueueProducerService,
    private auditService: AuditService,
  ) {}

  async create(
    driverId: string,
    companyId: string,
    createTripDto: CreateTripDto,
  ) {
    const driver = await this.prisma.user.findFirst({
      where: { id: driverId, companyId, role: { name: 'DRIVER' } },
    });

    if (!driver) throw new ResourceNotFoundException('Driver', driverId);

    const existing = await this.prisma.trip.findFirst({
      where: { companyId, tripId: createTripDto.tripId },
    });

    if (existing)
      throw new ConflictException('Trip already registered for this company');

    const trip = await this.prisma.trip.create({
      data: {
        ...createTripDto,
        driverId,
        companyId,
        sourceType: createTripDto.screenshotUrl ? 'ocr' : 'manual',
      },
      include: {
        driver: { select: DRIVER_SELECT },
        alerts: true,
      },
    });

    await this.auditService.log({
      action: 'create_trip',
      userId: driverId,
      companyId,
      metadata: {
        tripId: trip.id,
        relayTripId: trip.tripId,
        sourceType: trip.sourceType,
      },
    });

    if (createTripDto.screenshotUrl) {
      await this.queueProducer.enqueueOcr({
        tripId: trip.id,
        companyId,
        screenshotUrl: createTripDto.screenshotUrl,
      });
    }

    return trip;
  }

  async findByDriver(
    driverId: string,
    companyId: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where = { driverId, companyId };

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: { driver: { select: DRIVER_SELECT }, alerts: true },
        orderBy: { registeredAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      data: trips,
      meta: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllTrips(
    user: RequestUser,
    filters?: TripFilterDto,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (user.role !== 'SUPER_ADMIN') {
      where.companyId = user.companyId;
    } else if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters?.status) where.status = filters.status;
    if (filters?.driverId) where.driverId = filters.driverId;
    if (filters?.tripId) where.tripId = filters.tripId;

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: { driver: { select: DRIVER_SELECT }, alerts: true },
        orderBy: { registeredAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      data: trips,
      meta: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: RequestUser) {
    const where: any = { id };

    if (user.role !== 'SUPER_ADMIN') {
      where.companyId = user.companyId;
    }

    const trip = await this.prisma.trip.findFirst({
      where,
      include: { driver: { select: DRIVER_SELECT }, alerts: true },
    });

    if (!trip) throw new ResourceNotFoundException('Trip', id);

    return trip;
  }

  async update(id: string, user: RequestUser, updateTripDto: UpdateTripDto) {
    await this.findOne(id, user);

    return this.prisma.trip.update({
      where: { id },
      data: updateTripDto,
      include: { driver: { select: DRIVER_SELECT }, alerts: true },
    });
  }

  async delete(id: string, user: RequestUser) {
    await this.findOne(id, user);

    await this.auditService.log({
      action: 'delete_trip',
      userId: user.id,
      companyId: user.companyId,
      metadata: { tripId: id },
    });

    return this.prisma.trip.delete({ where: { id } });
  }

  async getTodayStats(user: RequestUser) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: any = { registeredAt: { gte: today } };

    if (user.role !== 'SUPER_ADMIN') {
      where.companyId = user.companyId;
    }

    const stats = await this.prisma.trip.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    return {
      date: today.toISOString().split('T')[0],
      stats,
      totalToday: stats.reduce((sum, s) => sum + s._count, 0),
    };
  }
}
