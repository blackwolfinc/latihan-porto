import { SetMetadata } from '@nestjs/common';
import { PlanFeature } from '../../subscription/plan-limits.config';

export const PLAN_FEATURE_KEY = 'plan_feature';
export const RequireFeature = (feature: PlanFeature) =>
  SetMetadata(PLAN_FEATURE_KEY, feature);
