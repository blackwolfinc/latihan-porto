import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCarDto) {
    return this.prisma.car.create({
      data: {
        brand: dto.brand,
        model: dto.model,
        year: dto.year,
        plateNumber: dto.plateNumber,
        color: dto.color,
        category: dto.category as any,
        branchId: dto.branchId,
        dailyRate: dto.dailyRate,
        imageUrls: dto.imageUrls || [],
        seatCount: dto.seatCount,
        transmission: dto.transmission as any,
        fuelType: dto.fuelType as any,
        odometer: dto.odometer || 0,
        description: dto.description,
      },
      include: { branch: { select: { id: true, name: true } } },
    });
  }

  async findAll(query: {
    branchId?: string; category?: string; status?: string;
    search?: string; page?: number; limit?: number;
  }) {
    const { branchId, category, status, search, page = 1, limit = 10 } = query;
    const where: any = { isActive: true };

    if (branchId) where.branchId = branchId;
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { plateNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.car.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          branch: { select: { id: true, name: true } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.car.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const car = await this.prisma.car.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true } },
        documents: true,
        _count: { select: { bookings: true, maintenance: true } },
      },
    });
    if (!car) throw new NotFoundException('Car not found');
    return car;
  }

  async findAvailable(startDate: string, endDate: string, branchId?: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const bookedCarIds = await this.prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
      select: { carId: true },
    });

    const bookedIds = bookedCarIds.map((b) => b.carId);

    const where: any = {
      isActive: true,
      status: 'AVAILABLE',
      id: { notIn: bookedIds },
    };

    if (branchId) where.branchId = branchId;

    return this.prisma.car.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true } },
      },
      orderBy: { dailyRate: 'asc' },
    });
  }

  async update(id: string, dto: UpdateCarDto) {
    await this.findOne(id);
    return this.prisma.car.update({
      where: { id },
      data: dto as any,
      include: { branch: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.car.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addDocument(carId: string, data: { type: string; number: string; expiryDate: string; fileUrl: string }) {
    await this.findOne(carId);
    return this.prisma.carDocument.create({
      data: {
        carId,
        type: data.type as any,
        number: data.number,
        expiryDate: new Date(data.expiryDate),
        fileUrl: data.fileUrl,
      },
    });
  }

  async getDocuments(carId: string) {
    return this.prisma.carDocument.findMany({
      where: { carId },
      orderBy: { expiryDate: 'asc' },
    });
  }
}
