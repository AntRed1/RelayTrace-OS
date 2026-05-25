/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueProducerService } from '../queue/queue-producer.service';

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(
    private prisma: PrismaService,
    private queueProducer: QueueProducerService,
  ) {}

  async reconcile(params: {
    relayEmailLogId: string;
    companyId: string;
    relayTripId: string;
  }) {
    const { relayEmailLogId, companyId, relayTripId } = params;

    const trip = await this.prisma.trip.findFirst({
      where: { companyId, tripId: relayTripId },
    });

    const matched = !!trip;
    const tripDbId = trip?.id ?? null;

    const reconciliation = await this.prisma.reconciliation.create({
      data: {
        companyId,
        tripId: tripDbId,
        relayEmailLogId,
        matched,
        discrepancyReason: matched
          ? null
          : `No driver registered trip ${relayTripId}`,
      },
    });

    await this.prisma.relayEmailLog.update({
      where: { id: relayEmailLogId },
      data: { reconciliationStatus: matched ? 'matched' : 'unmatched' },
    });

    if (!matched) {
      await this.queueProducer.enqueueAlert({
        companyId,
        tripId: relayTripId,
        alertType: 'missing_trip',
      });
      this.logger.warn(
        `Unmatched trip ${relayTripId} for company ${companyId}`,
      );
    } else if (trip) {
      const duplicates = await this.prisma.trip.count({
        where: { companyId, tripId: relayTripId },
      });
      if (duplicates > 1) {
        await this.queueProducer.enqueueAlert({
          companyId,
          tripId: trip.id,
          alertType: 'duplicate_trip',
        });
        this.logger.warn(
          `Duplicate trip ${relayTripId} for company ${companyId}`,
        );
      }
    }

    return reconciliation;
  }

  async findByCompany(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.reconciliation.findMany({
        where: { companyId },
        include: {
          trip: { include: { driver: { select: { id: true, name: true } } } },
          relayEmailLog: true,
        },
        orderBy: { checkedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.reconciliation.count({ where: { companyId } }),
    ]);
    return {
      data,
      meta: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSummary(companyId: string) {
    const [total, matched, unmatched] = await Promise.all([
      this.prisma.reconciliation.count({ where: { companyId } }),
      this.prisma.reconciliation.count({ where: { companyId, matched: true } }),
      this.prisma.reconciliation.count({
        where: { companyId, matched: false },
      }),
    ]);
    return {
      total,
      matched,
      unmatched,
      matchRate: total ? (matched / total) * 100 : 0,
    };
  }
}
