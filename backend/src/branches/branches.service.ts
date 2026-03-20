import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
  ) {}

  async create(dto: CreateBranchDto) {
    if (dto.organizationId) {
      await this.subscriptionService.checkBranchLimit(dto.organizationId);
    }
    return this.prisma.branch.create({ data: dto });
  }

  async findAll(query: { city?: string; search?: string; page?: number; limit?: number }) {
    const { city, search, page = 1, limit = 10 } = query;
    const where: any = { isActive: true };

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.branch.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { cars: true, users: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.branch.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        _count: { select: { cars: true, users: true, bookings: true } },
      },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, dto: UpdateBranchDto) {
    await this.findOne(id);
    return this.prisma.branch.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.branch.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
