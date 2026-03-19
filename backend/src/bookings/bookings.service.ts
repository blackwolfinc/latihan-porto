import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: CreateBookingDto) {
    const car = await this.prisma.car.findUnique({ where: { id: dto.carId } });
    if (!car) throw new NotFoundException('Car not found');
    if (car.status !== 'AVAILABLE') throw new BadRequestException('Car is not available');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) throw new BadRequestException('End date must be after start date');

    const totalAmount = Number(car.dailyRate) * days;

    const conflicting = await this.prisma.booking.findFirst({
      where: {
        carId: dto.carId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (conflicting) throw new BadRequestException('Car is already booked for selected dates');

    return this.prisma.booking.create({
      data: {
        customerId,
        carId: dto.carId,
        branchId: dto.branchId,
        driverId: dto.driverId,
        startDate,
        endDate,
        pickupLocation: dto.pickupLocation,
        dropoffLocation: dto.dropoffLocation,
        withDriver: dto.withDriver || false,
        totalAmount,
        notes: dto.notes,
      },
      include: {
        car: { select: { id: true, brand: true, model: true, plateNumber: true } },
        customer: { select: { id: true, name: true, email: true } },
        driver: { select: { id: true, user: { select: { name: true } } } },
      },
    });
  }

  async findAll(query: {
    status?: string; branchId?: string; customerId?: string;
    search?: string; page?: number; limit?: number;
  }) {
    const { status, branchId, customerId, search, page = 1, limit = 10 } = query;
    const where: any = {};

    if (status) where.status = status;
    if (branchId) where.branchId = branchId;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { car: { brand: { contains: search, mode: 'insensitive' } } },
        { car: { plateNumber: { contains: search, mode: 'insensitive' } } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          car: { select: { id: true, brand: true, model: true, plateNumber: true, imageUrls: true } },
          customer: { select: { id: true, name: true, email: true, phone: true } },
          driver: { select: { id: true, user: { select: { name: true } } } },
          payment: { select: { id: true, status: true, amount: true } },
          branch: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        car: true,
        customer: { select: { id: true, name: true, email: true, phone: true } },
        driver: { include: { user: { select: { name: true, phone: true } } } },
        payment: true,
        inspections: true,
        reviews: true,
        contract: true,
        branch: { select: { id: true, name: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async update(id: string, dto: UpdateBookingDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.booking.update({
      where: { id },
      data,
      include: {
        car: { select: { id: true, brand: true, model: true, plateNumber: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const booking = await this.findOne(id);

    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['ACTIVE', 'CANCELLED'],
      ACTIVE: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${booking.status} to ${status}`);
    }

    const updateData: any = { status };

    if (status === 'ACTIVE') {
      await this.prisma.car.update({ where: { id: booking.carId }, data: { status: 'RENTED' } });
      if (booking.driverId) {
        await this.prisma.driver.update({ where: { id: booking.driverId }, data: { status: 'ON_TRIP' } });
      }
    }

    if (status === 'COMPLETED') {
      await this.prisma.car.update({ where: { id: booking.carId }, data: { status: 'AVAILABLE' } });
      if (booking.driverId) {
        await this.prisma.driver.update({
          where: { id: booking.driverId },
          data: { status: 'AVAILABLE', totalTrips: { increment: 1 } },
        });
      }
    }

    if (status === 'CANCELLED') {
      await this.prisma.car.update({ where: { id: booking.carId }, data: { status: 'AVAILABLE' } });
      if (booking.driverId) {
        await this.prisma.driver.update({ where: { id: booking.driverId }, data: { status: 'AVAILABLE' } });
      }
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        car: { select: { id: true, brand: true, model: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async getCalendar(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      include: {
        car: { select: { id: true, brand: true, model: true, plateNumber: true, color: true } },
        customer: { select: { id: true, name: true } },
        driver: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async remove(id: string) {
    const booking = await this.findOne(id);
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Can only delete pending bookings');
    }
    return this.prisma.booking.delete({ where: { id } });
  }
}
