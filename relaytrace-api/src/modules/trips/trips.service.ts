/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto, UpdateTripDto, TripFilterDto } from './dto/trips.dtos';
import {
  ResourceNotFoundException,
  ConflictException,
} from '../../common/exceptions/custom.exceptions';
import { QueueProducerService } from '../queue/queue-producer.service';
import { RequestUser } from '../../common/types/user.types';
import { AuditService } from '../audit/audit.service';
import { AzureBlobService } from '../../common/azure-blob/azure-blob.service';

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

// SAS URL expiry for screenshot display: 2 hours
const SCREENSHOT_SAS_EXPIRY_MINUTES = 120;

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    private prisma: PrismaService,
    private queueProducer: QueueProducerService,
    private auditService: AuditService,
    private blobService: AzureBlobService,
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

    const hasBlobPath = !!createTripDto.screenshotUrl;

    const trip = await this.prisma.trip.create({
      data: {
        ...createTripDto,
        driverId,
        companyId,
        // sourceType starts as 'manual'; OCR processor updates it to 'ocr' on success.
        sourceType: 'manual',
        // ocrStatus tracks the async pipeline; 'none' when no screenshot was uploaded.
        ocrStatus: hasBlobPath ? 'pending' : 'none',
      },
      include: {
        driver: { select: DRIVER_SELECT },
        alerts: true,
      },
    });

    await this.auditService.log({
      action: 'create_trip',
      actor:  { userId: driverId, companyId },
      metadata: {
        tripId: trip.id,
        relayTripId: trip.tripId,
        hasBlobPath,
      },
    });

    if (hasBlobPath) {
      await this.queueProducer.enqueueOcr({
        tripId:    trip.id,
        companyId,
        blobPath:  createTripDto.screenshotUrl!, // blob path stored in screenshotUrl field
      });
    }

    return this.enrichWithSasUrl(trip);
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
      data: await this.enrichManyWithSasUrls(trips),
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
      data: await this.enrichManyWithSasUrls(trips),
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

    return this.enrichWithSasUrl(trip);
  }

  async update(id: string, user: RequestUser, updateTripDto: UpdateTripDto) {
    await this.findOne(id, user);

    const updated = await this.prisma.trip.update({
      where: { id },
      data: updateTripDto,
      include: { driver: { select: DRIVER_SELECT }, alerts: true },
    });

    return this.enrichWithSasUrl(updated);
  }

  async delete(id: string, user: RequestUser) {
    await this.findOne(id, user);

    await this.auditService.log({
      action: 'delete_trip',
      actor:  { userId: user.id, companyId: user.companyId },
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

  // ── Private: SAS URL enrichment ───────────────────────────────────────────

  /**
   * If screenshotUrl is a blob path (not an http URL or legacy /screenshots/ path),
   * replace it with a fresh 2-hour SAS URL for browser display.
   * Silently skips if blob storage is not configured or generation fails.
   */
  private async enrichWithSasUrl<T extends { screenshotUrl?: string | null }>(
    trip: T,
  ): Promise<T> {
    if (!AzureBlobService.isBlobPath(trip.screenshotUrl)) {
      return trip; // already a URL or null — nothing to do
    }

    const parsed = AzureBlobService.parseBlobPath(trip.screenshotUrl!);
    if (!parsed) return trip;

    try {
      const sasUrl = await this.blobService.generateSasUrl(
        parsed.container,
        parsed.blobName,
        SCREENSHOT_SAS_EXPIRY_MINUTES,
      );
      return { ...trip, screenshotUrl: sasUrl };
    } catch (err) {
      this.logger.warn(
        `Could not generate SAS URL for blob "${trip.screenshotUrl}": ${(err as Error).message}`,
      );
      return trip; // return blob path unchanged — client will get a non-loadable URL
    }
  }

  /**
   * Batch SAS URL enrichment. Uses Promise.all so all trips are enriched in parallel.
   * With a cached delegation key, signing is local (no Azure API call per trip).
   */
  private enrichManyWithSasUrls<T extends { screenshotUrl?: string | null }>(
    trips: T[],
  ): Promise<T[]> {
    return Promise.all(trips.map((t) => this.enrichWithSasUrl(t)));
  }
}
