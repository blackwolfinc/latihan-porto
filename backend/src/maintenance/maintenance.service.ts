import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMaintenanceDto) {
    const record = await this.prisma.maintenanceRecord.create({
      data: {
        carId: dto.carId,
        type: dto.type as any,
        description: dto.description,
        cost: dto.cost,
        date: new Date(dto.date),
        nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
        odometer: dto.odometer,
        vendor: dto.vendor,
      },
      include: { car: { select: { id: true, brand: true, model: true, plateNumber: true } } },
    });

    if (dto.odometer) {
      await this.prisma.car.update({
        where: { id: dto.carId },
        data: { odometer: dto.odometer },
      });
    }

    return record;
  }

  async findAll(query: { carId?: string; type?: string; page?: number; limit?: number }) {
    const { carId, type, page = 1, limit = 10 } = query;
    const where: any = {};

    if (carId) where.carId = carId;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.maintenanceRecord.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { car: { select: { id: true, brand: true, model: true, plateNumber: true } } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.maintenanceRecord.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const record = await this.prisma.maintenanceRecord.findUnique({
      where: { id },
      include: { car: { select: { id: true, brand: true, model: true, plateNumber: true } } },
    });
    if (!record) throw new NotFoundException('Maintenance record not found');
    return record;
  }

  async getUpcoming(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.maintenanceRecord.findMany({
      where: {
        nextDueDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      include: { car: { select: { id: true, brand: true, model: true, plateNumber: true } } },
      orderBy: { nextDueDate: 'asc' },
    });
  }

  async update(id: string, dto: UpdateMaintenanceDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    if (dto.nextDueDate) data.nextDueDate = new Date(dto.nextDueDate);
    return this.prisma.maintenanceRecord.update({
      where: { id },
      data,
      include: { car: { select: { id: true, brand: true, model: true, plateNumber: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.maintenanceRecord.delete({ where: { id } });
  }
}
