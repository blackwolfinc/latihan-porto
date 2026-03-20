import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Organization with this slug already exists');
    }

    return this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        city: dto.city,
        taxId: dto.taxId,
        website: dto.website,
        logo: dto.logo,
      },
      include: {
        branches: true,
        _count: { select: { users: true, branches: true, invoices: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        _count: { select: { users: true, branches: true, invoices: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        branches: true,
        subscription: true,
        _count: { select: { users: true, branches: true, invoices: true } },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async findBySlug(slug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug },
      include: {
        branches: true,
        _count: { select: { users: true, branches: true, invoices: true } },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async findCurrent(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user || !user.organizationId) {
      throw new NotFoundException('User is not associated with any organization');
    }

    return this.findOne(user.organizationId);
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);

    if (dto.slug) {
      const existing = await this.prisma.organization.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Organization with this slug already exists');
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data: dto,
      include: {
        branches: true,
        _count: { select: { users: true, branches: true, invoices: true } },
      },
    });
  }

  async updateCurrent(userId: string, dto: UpdateOrganizationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user || !user.organizationId) {
      throw new NotFoundException('User is not associated with any organization');
    }

    return this.update(user.organizationId, dto);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.organization.delete({
      where: { id },
    });
  }
}
