import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class GpsService {
  constructor(private prisma: PrismaService) {}

  async getCarHistory(carId: string, query: { startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const { startDate, endDate, page = 1, limit = 100 } = query;
    const where: any = { carId };

    if (startDate || endDate) {
      where.recordedAt = {};
      if (startDate) where.recordedAt.gte = new Date(startDate);
      if (endDate) where.recordedAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.gpsLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.gpsLog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getBookingRoute(bookingId: string) {
    return this.prisma.gpsLog.findMany({
      where: { bookingId },
      orderBy: { recordedAt: 'asc' },
    });
  }

  async getLatestPositions() {
    const cars = await this.prisma.car.findMany({
      where: { status: 'RENTED' },
      select: { id: true, brand: true, model: true, plateNumber: true },
    });

    const positions = await Promise.all(
      cars.map(async (car) => {
        const lastLog = await this.prisma.gpsLog.findFirst({
          where: { carId: car.id },
          orderBy: { recordedAt: 'desc' },
        });
        return { ...car, lastPosition: lastLog };
      }),
    );

    return positions;
  }
}
