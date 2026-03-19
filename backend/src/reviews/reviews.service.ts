import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReviewDto) {
    const review = await this.prisma.review.create({
      data: {
        bookingId: dto.bookingId,
        customerId: dto.customerId,
        driverId: dto.driverId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        customer: { select: { id: true, name: true, avatar: true } },
        booking: {
          select: {
            id: true,
            car: { select: { id: true, brand: true, model: true } },
          },
        },
      },
    });

    if (dto.driverId) {
      await this.updateDriverRating(dto.driverId);
    }

    return review;
  }

  async findAll(query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: { select: { id: true, name: true, avatar: true } },
          booking: {
            select: {
              id: true,
              car: { select: { id: true, brand: true, model: true } },
            },
          },
          driver: {
            select: { id: true, user: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, avatar: true } },
        booking: {
          select: {
            id: true,
            car: { select: { id: true, brand: true, model: true, plateNumber: true } },
          },
        },
        driver: {
          select: { id: true, user: { select: { name: true } } },
        },
      },
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async findByCarId(carId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        booking: { carId },
      },
      include: {
        customer: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRatings = reviews.length;
    const avgRating = totalRatings > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    return {
      reviews,
      aggregate: {
        totalRatings,
        avgRating: Math.round(avgRating * 10) / 10,
      },
    };
  }

  async findByDriverId(driverId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { driverId },
      include: {
        customer: { select: { id: true, name: true, avatar: true } },
        booking: {
          select: {
            id: true,
            car: { select: { id: true, brand: true, model: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRatings = reviews.length;
    const avgRating = totalRatings > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    const roundedAvg = Math.round(avgRating * 10) / 10;

    await this.prisma.driver.update({
      where: { id: driverId },
      data: { ratingAvg: roundedAvg },
    });

    return {
      reviews,
      aggregate: {
        totalRatings,
        avgRating: roundedAvg,
      },
    };
  }

  async update(id: string, dto: UpdateReviewDto) {
    const review = await this.findOne(id);
    const updated = await this.prisma.review.update({
      where: { id },
      data: dto,
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    if (review.driver?.id) {
      await this.updateDriverRating(review.driver.id);
    }

    return updated;
  }

  async remove(id: string) {
    const review = await this.findOne(id);
    await this.prisma.review.delete({ where: { id } });

    if (review.driver?.id) {
      await this.updateDriverRating(review.driver.id);
    }

    return { message: 'Review deleted' };
  }

  private async updateDriverRating(driverId: string) {
    const result = await this.prisma.review.aggregate({
      where: { driverId },
      _avg: { rating: true },
    });

    await this.prisma.driver.update({
      where: { id: driverId },
      data: { ratingAvg: result._avg.rating || 0 },
    });
  }
}
