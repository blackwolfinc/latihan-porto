import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PLAN_LIMITS, PlanFeature } from './plan-limits.config';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getOrganizationPlan(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, subscription: true },
    });

    if (!org) throw new NotFoundException('Organization not found');

    return {
      plan: org.plan,
      limits: PLAN_LIMITS[org.plan],
      subscription: org.subscription,
    };
  }

  async getPlanByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        organizationId: true,
        organization: { select: { plan: true } },
      },
    });

    if (!user?.organizationId || !user.organization) {
      return { plan: 'FREE' as const, limits: PLAN_LIMITS.FREE };
    }

    const plan = user.organization.plan;
    return { plan, limits: PLAN_LIMITS[plan] };
  }

  async checkVehicleLimit(organizationId: string, vehicleType: 'CAR' | 'MOTORCYCLE' = 'CAR'): Promise<void> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });

    if (!org) throw new NotFoundException('Organization not found');

    const limits = PLAN_LIMITS[org.plan];
    const maxLimit = vehicleType === 'CAR' ? limits.maxCars : limits.maxMotorcycles;
    if (maxLimit === Infinity) return;

    const count = await this.prisma.car.count({
      where: {
        branch: { organizationId },
        vehicleType,
        isActive: true,
      },
    });

    const label = vehicleType === 'CAR' ? 'mobil' : 'motor';

    if (count >= maxLimit) {
      throw new ForbiddenException(
        `Paket ${org.plan} hanya mendukung maksimal ${maxLimit} ${label}. Upgrade paket Anda untuk menambah lebih banyak ${label}.`,
      );
    }
  }

  async checkBranchLimit(organizationId: string): Promise<void> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });

    if (!org) throw new NotFoundException('Organization not found');

    const limits = PLAN_LIMITS[org.plan];
    if (limits.maxBranches === Infinity) return;

    const count = await this.prisma.branch.count({
      where: { organizationId, isActive: true },
    });

    if (count >= limits.maxBranches) {
      throw new ForbiddenException(
        `Paket ${org.plan} hanya mendukung maksimal ${limits.maxBranches} cabang. Upgrade paket Anda untuk menambah lebih banyak cabang.`,
      );
    }
  }

  async checkFeatureAccess(
    organizationId: string,
    feature: PlanFeature,
  ): Promise<void> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });

    if (!org) throw new NotFoundException('Organization not found');

    const limits = PLAN_LIMITS[org.plan];
    if (!limits.features[feature]) {
      throw new ForbiddenException(
        `Fitur ini tidak tersedia pada paket ${org.plan}. Upgrade ke paket yang lebih tinggi untuk mengakses fitur ini.`,
      );
    }
  }

  async getUsageStats(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });

    if (!org) throw new NotFoundException('Organization not found');

    const [carCount, motorcycleCount, branchCount] = await Promise.all([
      this.prisma.car.count({
        where: { branch: { organizationId }, vehicleType: 'CAR', isActive: true },
      }),
      this.prisma.car.count({
        where: { branch: { organizationId }, vehicleType: 'MOTORCYCLE', isActive: true },
      }),
      this.prisma.branch.count({
        where: { organizationId, isActive: true },
      }),
    ]);

    const limits = PLAN_LIMITS[org.plan];

    return {
      plan: org.plan,
      limits,
      usage: {
        cars: carCount,
        motorcycles: motorcycleCount,
        branches: branchCount,
      },
    };
  }

  async upgradePlan(organizationId: string, newPlan: string) {
    const validPlans = ['FREE', 'STANDARD', 'PREMIUM'];
    if (!validPlans.includes(newPlan)) {
      throw new ForbiddenException('Invalid plan');
    }

    return this.prisma.organization.update({
      where: { id: organizationId },
      data: { plan: newPlan as any },
    });
  }
}
