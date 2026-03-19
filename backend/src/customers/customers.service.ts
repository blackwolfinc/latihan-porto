import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        role: 'CUSTOMER',
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
  }

  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 10 } = query;
    const where: any = { role: 'CUSTOMER', isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, email: true, phone: true, avatar: true,
          createdAt: true,
          _count: { select: { bookings: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const customer = await this.prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      select: {
        id: true, name: true, email: true, phone: true, avatar: true,
        createdAt: true, updatedAt: true,
        _count: { select: { bookings: true, reviews: true } },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async getHistory(id: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;
    await this.findOne(id);

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: { customerId: id },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          car: { select: { id: true, brand: true, model: true, plateNumber: true, imageUrls: true } },
          payment: { select: { status: true, amount: true } },
          reviews: { select: { rating: true, comment: true } },
          branch: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where: { customerId: id } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, phone: true, avatar: true, updatedAt: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
