import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { PLAN_FEATURE_KEY } from '../decorators/plan-feature.decorator';
import { PLAN_LIMITS, PlanFeature } from '../../subscription/plan-limits.config';

@Injectable()
export class PlanFeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<PlanFeature>(
      PLAN_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.organizationId) {
      throw new ForbiddenException('User not associated with any organization');
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { plan: true },
    });

    if (!org) {
      throw new ForbiddenException('Organization not found');
    }

    const limits = PLAN_LIMITS[org.plan];
    if (!limits || !limits.features[requiredFeature]) {
      throw new ForbiddenException(
        `Fitur ini memerlukan upgrade paket. Paket ${org.plan} Anda tidak memiliki akses ke fitur ini.`,
      );
    }

    return true;
  }
}
