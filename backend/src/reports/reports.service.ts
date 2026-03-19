import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalCars, activeBookings, availableDrivers, totalBookings, totalCustomers, monthlyRevenue] =
      await Promise.all([
        this.prisma.car.count({ where: { isActive: true } }),
        this.prisma.booking.count({ where: { status: 'ACTIVE' } }),
        this.prisma.driver.count({ where: { status: 'AVAILABLE' } }),
        this.prisma.booking.count(),
        this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
        this.getMonthlyRevenue(),
      ]);

    return {
      totalCars,
      activeBookings,
      totalBookings,
      totalCustomers,
      availableDrivers,
      monthlyRevenue,
    };
  }

  private async getMonthlyRevenue(): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const result = await this.prisma.payment.aggregate({
      where: {
        status: 'PAID',
        paidAt: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    return Number(result._sum.amount) || 0;
  }

  async getRevenue(query: {
    startDate: string;
    endDate: string;
    branchId?: string;
  }) {
    const { startDate, endDate, branchId } = query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const where: any = {
      status: 'PAID',
      paidAt: { gte: start, lte: end },
    };

    if (branchId) {
      where.booking = { branchId };
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            branchId: true,
            branch: { select: { id: true, name: true } },
            car: { select: { id: true, brand: true, model: true } },
          },
        },
      },
      orderBy: { paidAt: 'asc' },
    });

    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const byBranch: Record<string, { branchName: string; total: number; count: number }> = {};
    for (const payment of payments) {
      const bId = payment.booking.branchId;
      const bName = payment.booking.branch.name;
      if (!byBranch[bId]) {
        byBranch[bId] = { branchName: bName, total: 0, count: 0 };
      }
      byBranch[bId].total += Number(payment.amount);
      byBranch[bId].count += 1;
    }

    const byMonth: Record<string, number> = {};
    for (const payment of payments) {
      if (payment.paidAt) {
        const key = `${payment.paidAt.getFullYear()}-${String(payment.paidAt.getMonth() + 1).padStart(2, '0')}`;
        byMonth[key] = (byMonth[key] || 0) + Number(payment.amount);
      }
    }

    return {
      total,
      count: payments.length,
      byBranch,
      byMonth,
      startDate,
      endDate,
    };
  }

  async getFleetUtilization(branchId?: string) {
    const carWhere: any = { isActive: true };
    if (branchId) carWhere.branchId = branchId;

    const [totalCars, rentedCars, maintenanceCars] = await Promise.all([
      this.prisma.car.count({ where: carWhere }),
      this.prisma.car.count({ where: { ...carWhere, status: 'RENTED' } }),
      this.prisma.car.count({ where: { ...carWhere, status: 'MAINTENANCE' } }),
    ]);

    const availableCars = totalCars - rentedCars - maintenanceCars;
    const utilizationRate = totalCars > 0 ? (rentedCars / totalCars) * 100 : 0;

    return {
      totalCars,
      rentedCars,
      availableCars,
      maintenanceCars,
      utilizationRate: Math.round(utilizationRate * 10) / 10,
    };
  }

  async getExpenses(query: {
    startDate: string;
    endDate: string;
    branchId?: string;
    category?: string;
  }) {
    const { startDate, endDate, branchId, category } = query;
    const where: any = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    if (branchId) where.branchId = branchId;
    if (category) where.category = category;

    const expenses = await this.prisma.expense.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true } },
        car: { select: { id: true, brand: true, model: true, plateNumber: true } },
      },
      orderBy: { date: 'desc' },
    });

    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const byCategory: Record<string, number> = {};
    for (const expense of expenses) {
      byCategory[expense.category] =
        (byCategory[expense.category] || 0) + Number(expense.amount);
    }

    const byBranch: Record<string, { branchName: string; total: number }> = {};
    for (const expense of expenses) {
      const bId = expense.branchId;
      const bName = expense.branch.name;
      if (!byBranch[bId]) {
        byBranch[bId] = { branchName: bName, total: 0 };
      }
      byBranch[bId].total += Number(expense.amount);
    }

    return {
      total,
      count: expenses.length,
      byCategory,
      byBranch,
      expenses,
      startDate,
      endDate,
    };
  }
}
