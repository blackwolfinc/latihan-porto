import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDriverDto) {
    await this.prisma.user.update({
      where: { id: dto.userId },
      data: { role: 'DRIVER' },
    });

    return this.prisma.driver.create({
      data: {
        userId: dto.userId,
        licenseNumber: dto.licenseNumber,
        licenseType: dto.licenseType,
        licenseExpiry: new Date(dto.licenseExpiry),
      },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });
  }

  async findAll(query: { status?: string; search?: string; page?: number; limit?: number }) {
    const { status, search, page = 1, limit = 10 } = query;
    const where: any = {};

    if (status) where.status = status;
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
          documents: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        documents: true,
        _count: { select: { bookings: true, reviews: true } },
      },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async findAvailable(date?: string) {
    const where: any = { status: 'AVAILABLE' };

    if (date) {
      const targetDate = new Date(date);
      where.bookings = {
        none: {
          status: { in: ['CONFIRMED', 'ACTIVE'] },
          startDate: { lte: targetDate },
          endDate: { gte: targetDate },
        },
      };
    }

    return this.prisma.driver.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true, avatar: true } },
      },
      orderBy: { ratingAvg: 'desc' },
    });
  }

  async update(id: string, dto: UpdateDriverDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.licenseExpiry) data.licenseExpiry = new Date(dto.licenseExpiry);
    return this.prisma.driver.update({
      where: { id },
      data,
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async toggleStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.driver.update({
      where: { id },
      data: { status: status as any },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async addDocument(driverId: string, data: { type: string; number: string; expiryDate: string; fileUrl: string }) {
    await this.findOne(driverId);
    return this.prisma.driverDocument.create({
      data: {
        driverId,
        type: data.type as any,
        number: data.number,
        expiryDate: new Date(data.expiryDate),
        fileUrl: data.fileUrl,
      },
    });
  }

  async remove(id: string) {
    const driver = await this.findOne(id);
    await this.prisma.user.update({ where: { id: driver.userId }, data: { role: 'CUSTOMER' } });
    return this.prisma.driver.delete({ where: { id } });
  }
}
