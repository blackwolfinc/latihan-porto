import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';

@Injectable()
export class InspectionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInspectionDto) {
    return this.prisma.inspection.create({
      data: {
        bookingId: dto.bookingId,
        carId: dto.carId,
        type: dto.type as any,
        inspectorId: dto.inspectorId,
        exteriorStatus: dto.exteriorStatus,
        interiorStatus: dto.interiorStatus,
        engineStatus: dto.engineStatus,
        notes: dto.notes,
        damagePhotos: dto.damagePhotos || [],
      },
      include: {
        booking: { select: { id: true, startDate: true, endDate: true, status: true } },
        car: { select: { id: true, brand: true, model: true, plateNumber: true } },
        inspector: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(query: { carId?: string; bookingId?: string; type?: string; page?: number; limit?: number }) {
    const { carId, bookingId, type, page = 1, limit = 10 } = query;
    const where: any = {};

    if (carId) where.carId = carId;
    if (bookingId) where.bookingId = bookingId;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.inspection.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          booking: { select: { id: true, status: true } },
          car: { select: { id: true, brand: true, model: true, plateNumber: true } },
          inspector: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inspection.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true, startDate: true, endDate: true, status: true,
            customer: { select: { id: true, name: true } },
          },
        },
        car: { select: { id: true, brand: true, model: true, plateNumber: true } },
        inspector: { select: { id: true, name: true } },
      },
    });
    if (!inspection) throw new NotFoundException('Inspection not found');
    return inspection;
  }

  async findByBooking(bookingId: string) {
    return this.prisma.inspection.findMany({
      where: { bookingId },
      include: {
        car: { select: { id: true, brand: true, model: true, plateNumber: true } },
        inspector: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, dto: UpdateInspectionDto) {
    await this.findOne(id);
    return this.prisma.inspection.update({
      where: { id },
      data: {
        ...dto,
        damagePhotos: dto.damagePhotos,
      },
      include: {
        car: { select: { id: true, brand: true, model: true, plateNumber: true } },
        inspector: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inspection.delete({ where: { id } });
  }
}
