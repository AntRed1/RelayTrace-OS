import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorators/require-feature.decorator';
import { PlanFeature } from '../../config/plan.config';
import { PlanService } from '../../modules/plan/plan.service';

/**
 * Enforces plan-based feature access.
 * Must be applied AFTER JwtAuthGuard so `request.user` is populated.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, RolesGuard, PlanGuard)
 *   @RequireFeature('ocr')
 *   @Post('process')
 *   processOcr() { ... }
 *
 * SUPER_ADMIN always bypasses plan restrictions.
 */
@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private planService: PlanService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<PlanFeature>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No feature requirement → allow
    if (!feature) return true;

    const { user } = context.switchToHttp().getRequest();

    // SUPER_ADMIN bypasses all plan restrictions
    if (!user || user.role === 'SUPER_ADMIN') return true;

    // assertFeature throws FeatureNotAvailableException (402) if not allowed
    await this.planService.assertFeature(user.companyId, feature);
    return true;
  }
}
