import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        role: (dto.role as any) || 'CUSTOMER',
      },
      select: {
        id: true, email: true, name: true, phone: true,
        role: true, avatar: true, isActive: true, branchId: true,
        createdAt: true, updatedAt: true,
      },
    });
  }

  async findAll(query: { role?: string; branchId?: string; search?: string; page?: number; limit?: number }) {
    const { role, branchId, search, page = 1, limit = 10 } = query;
    const where: any = {};

    if (role) where.role = role;
    if (branchId) where.branchId = branchId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, email: true, name: true, phone: true,
          role: true, avatar: true, isActive: true, branchId: true,
          branch: { select: { id: true, name: true } },
          createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, phone: true,
        role: true, avatar: true, isActive: true, branchId: true,
        branch: { select: { id: true, name: true } },
        driver: true,
        createdAt: true, updatedAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const data: any = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, name: true, phone: true,
        role: true, avatar: true, isActive: true, branchId: true,
        createdAt: true, updatedAt: true,
      },
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
