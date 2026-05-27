import { SetMetadata } from '@nestjs/common';
import { PlanFeature } from '../../config/plan.config';

export const FEATURE_KEY = 'required_feature';

/**
 * Marks an endpoint as requiring a specific plan feature.
 * Works together with PlanGuard.
 *
 * @example
 *   @RequireFeature('ocr')
 *   @Post('process')
 *   processOcr() { ... }
 */
export const RequireFeature = (feature: PlanFeature) =>
  SetMetadata(FEATURE_KEY, feature);
