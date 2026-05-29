import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// ─── Action catalogue ─────────────────────────────────────────────────────────
// Add new actions here as the system grows; keep them in snake_case.

export type AuditAction =
  // Auth
  | 'login'
  | 'logout'
  // Trips
  | 'create_trip'
  | 'update_trip'
  | 'delete_trip'
  // Users
  | 'create_user'
  | 'update_user'
  | 'delete_user'
  | 'change_password'
  | 'revoke_access'
  | 'restore_access'
  // Plans (SUPER_ADMIN)
  | 'create_plan'
  | 'update_plan'
  | 'delete_plan'
  // Companies (SUPER_ADMIN)
  | 'approve_company'
  | 'reject_company';

// ─── Actor context ────────────────────────────────────────────────────────────

export interface AuditActor {
  userId:    string;
  companyId: string;
  /** Optional — populate from HTTP request where available */
  ipAddress?: string;
  userAgent?: string;
}

// ─── Query filters ────────────────────────────────────────────────────────────

export interface AuditQueryParams {
  /** null = all companies (SUPER_ADMIN only) */
  companyId?: string | null;
  userId?:    string;
  action?:    string;
  from?:      Date;
  to?:        Date;
  page?:      number;
  limit?:     number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Fire-and-forget audit event.
   * Never throws — a failed write must not break the main request flow.
   */
  async log(params: {
    action:     AuditAction;
    actor:      AuditActor;
    metadata?:  Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action:    params.action,
          userId:    params.actor.userId,
          companyId: params.actor.companyId,
          metadata:  params.metadata ? JSON.stringify(params.metadata) : '{}',
          ipAddress: params.actor.ipAddress ?? null,
          userAgent: params.actor.userAgent ?? null,
        },
      });
    } catch (err: unknown) {
      this.logger.error(
        `Audit log failed [${params.action}]: ${(err as Error).message}`,
        (err as Error).stack,
      );
    }
  }

  // ── Read (paginated) ───────────────────────────────────────────────────────

  async findMany(params: AuditQueryParams) {
    const page  = params.page  ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip  = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.companyId)              where.companyId = params.companyId;
    if (params.userId)                 where.userId    = params.userId;
    if (params.action)                 where.action    = params.action;
    if (params.from || params.to) {
      where.createdAt = {
        ...(params.from && { gte: params.from }),
        ...(params.to   && { lte: params.to   }),
      };
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user:    { select: { name: true, email: true } },
          company: { select: { name: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const data = logs.map((log) => ({
      id:          log.id,
      action:      log.action,
      companyId:   log.companyId,
      companyName: log.company?.name ?? null,
      userId:      log.userId,
      userName:    log.user?.name    ?? null,
      userEmail:   log.user?.email   ?? null,
      metadata:    this.safeParseJson(log.metadata),
      ipAddress:   log.ipAddress,
      userAgent:   log.userAgent,
      createdAt:   log.createdAt,
    }));

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

  // ── Private ────────────────────────────────────────────────────────────────

  private safeParseJson(raw: string): Record<string, unknown> {
    try { return JSON.parse(raw) as Record<string, unknown>; }
    catch { return {}; }
  }
}
