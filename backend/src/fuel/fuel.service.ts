import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';

@Injectable()
export class FuelService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFuelDto) {
    const log = await this.prisma.fuelLog.create({
      data: {
        carId: dto.carId,
        driverId: dto.driverId,
        liters: dto.liters,
        cost: dto.cost,
        odometer: dto.odometer,
        date: new Date(dto.date),
        fuelType: dto.fuelType as any,
      },
      include: {
        car: { select: { id: true, brand: true, model: true, plateNumber: true } },
        driver: { select: { id: true, user: { select: { name: true } } } },
      },
    });

    await this.prisma.car.update({
      where: { id: dto.carId },
      data: { odometer: dto.odometer },
    });

    return log;
  }

  async findAll(query: { carId?: string; driverId?: string; page?: number; limit?: number }) {
    const { carId, driverId, page = 1, limit = 10 } = query;
    const where: any = {};

    if (carId) where.carId = carId;
    if (driverId) where.driverId = driverId;

    const [data, total] = await Promise.all([
      this.prisma.fuelLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          car: { select: { id: true, brand: true, model: true, plateNumber: true } },
          driver: { select: { id: true, user: { select: { name: true } } } },
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.fuelLog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const log = await this.prisma.fuelLog.findUnique({
      where: { id },
      include: {
        car: { select: { id: true, brand: true, model: true, plateNumber: true } },
        driver: { select: { id: true, user: { select: { name: true } } } },
      },
    });
    if (!log) throw new NotFoundException('Fuel log not found');
    return log;
  }

  async update(id: string, dto: UpdateFuelDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return this.prisma.fuelLog.update({
      where: { id },
      data,
      include: {
        car: { select: { id: true, brand: true, model: true, plateNumber: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.fuelLog.delete({ where: { id } });
  }
}
