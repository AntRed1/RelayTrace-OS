import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PrismaService } from '../../prisma/prisma.service';
import { CacheService }  from '../cache/cache.service';
import { RequestUser }   from '../types/user.types';

/** How long to cache a company's subscriptionStatus in Redis (5 minutes). */
const SUB_STATUS_TTL_MS = 5 * 60 * 1000;

/**
 * Standard JWT guard extended with subscription-status enforcement.
 *
 * After the JWT is validated and request.user is populated, it verifies that
 * the user's company has an active Stripe subscription.
 *
 * Rules:
 *  - SUPER_ADMIN always bypasses the check.
 *  - Users without a companyId (edge-case) bypass the check.
 *  - A company with subscriptionStatus === 'canceled' gets HTTP 403.
 *  - 'active', 'past_due', 'trialing' and any other status are allowed through
 *    (past_due enforcement can be added here when dunning is needed).
 *  - The subscription status is cached in Redis for SUB_STATUS_TTL_MS to avoid
 *    a DB round-trip on every single request.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache:  CacheService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ── 1. Standard JWT validation — populates request.user ──────────────────
    const result = await (super.canActivate(context) as Promise<boolean>);
    if (!result) return false;

    // ── 2. Subscription check ────────────────────────────────────────────────
    const request = context.switchToHttp().getRequest();
    const user    = request.user as RequestUser | undefined;

    // Bypass: unauthenticated, SUPER_ADMIN, or no company context
    if (!user?.companyId || user.role === 'SUPER_ADMIN') return true;

    const cacheKey = `company:sub:${user.companyId}`;

    const status = await this.cache.getOrSet(
      cacheKey,
      async () => {
        const company = await this.prisma.company.findUnique({
          where:  { id: user.companyId },
          select: { subscriptionStatus: true },
        });
        return company?.subscriptionStatus ?? 'active';
      },
      SUB_STATUS_TTL_MS,
    );

    if (status === 'canceled') {
      this.logger.warn(
        `Blocked request from company ${user.companyId} — subscription canceled`,
      );
      throw new ForbiddenException(
        'Your subscription has been canceled. Please contact support to reactivate your account.',
      );
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest<TUser = any>(err: any, user: any, _info: any): TUser {
    if (err || !user) {
      throw (err as Error) ?? new UnauthorizedException('Invalid or expired token');
    }
    return user as TUser;
  }
}
