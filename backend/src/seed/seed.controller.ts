import { Controller, Post, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../common/prisma/prisma.service';
import { CarCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Controller('seed')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Post()
  async seed(@Query('key') key: string) {
    if (key !== process.env.JWT_SECRET) {
      return { error: 'Invalid seed key' };
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Clean existing data — leaf tables first (parallelized), then parent tables
    await Promise.all([
      this.prisma.invoiceItem.deleteMany(),
      this.prisma.notification.deleteMany(),
      this.prisma.gpsLog.deleteMany(),
      this.prisma.review.deleteMany(),
      this.prisma.inspection.deleteMany(),
      this.prisma.contract.deleteMany(),
      this.prisma.fuelLog.deleteMany(),
      this.prisma.maintenanceRecord.deleteMany(),
      this.prisma.expense.deleteMany(),
      this.prisma.carDocument.deleteMany(),
      this.prisma.driverDocument.deleteMany(),
    ]);
    await Promise.all([
      this.prisma.invoice.deleteMany(),
      this.prisma.payment.deleteMany(),
    ]);
    await this.prisma.booking.deleteMany();
    await Promise.all([
      this.prisma.driver.deleteMany(),
      this.prisma.car.deleteMany(),
    ]);
    await this.prisma.user.deleteMany();
    await this.prisma.branch.deleteMany();
    await this.prisma.organization.deleteMany();

    const organization = await this.prisma.organization.create({
      data: {
        name: 'CaritaHub Rental', slug: 'caritahub-rental',
        address: 'Jl. Sudirman No. 1, Jakarta Pusat', city: 'Jakarta',
        phone: '021-5551234', email: 'info@caritahub.com',
        plan: 'STANDARD', isActive: true,
      },
    });

    const branchJakarta = await this.prisma.branch.create({
      data: {
        name: 'Cabang Jakarta Pusat', address: 'Jl. Sudirman No. 1',
        city: 'Jakarta', phone: '021-5551234', lat: -6.2088, lng: 106.8456,
        organizationId: organization.id,
      },
    });

    const branchSurabaya = await this.prisma.branch.create({
      data: {
        name: 'Cabang Surabaya', address: 'Jl. Tunjungan No. 10',
        city: 'Surabaya', phone: '031-5321234', lat: -7.2575, lng: 112.7521,
        organizationId: organization.id,
      },
    });

    await this.prisma.user.create({
      data: {
        email: 'admin@caritahub.com', password: hashedPassword,
        name: 'Super Admin', phone: '081200000001', role: 'ADMIN',
        branchId: branchJakarta.id, organizationId: organization.id,
      },
    });

    await this.prisma.user.create({
      data: {
        email: 'manager@caritahub.com', password: hashedPassword,
        name: 'Budi Santoso', phone: '081200000002', role: 'MANAGER',
        branchId: branchJakarta.id, organizationId: organization.id,
      },
    });

    const staff1 = await this.prisma.user.create({
      data: {
        email: 'staff1@caritahub.com', password: hashedPassword,
        name: 'Siti Rahayu', phone: '081200000003', role: 'STAFF',
        branchId: branchJakarta.id, organizationId: organization.id,
      },
    });

    const driverUser1 = await this.prisma.user.create({
      data: {
        email: 'driver1@caritahub.com', password: hashedPassword,
        name: 'Ahmad Supir', phone: '081200000006', role: 'DRIVER',
        branchId: branchJakarta.id, organizationId: organization.id,
      },
    });

    const driverUser2 = await this.prisma.user.create({
      data: {
        email: 'driver2@caritahub.com', password: hashedPassword,
        name: 'Joko Antar', phone: '081200000007', role: 'DRIVER',
        branchId: branchSurabaya.id, organizationId: organization.id,
      },
    });

    const customer1 = await this.prisma.user.create({
      data: {
        email: 'customer1@example.com', password: hashedPassword,
        name: 'Andi Wijaya', phone: '081300000001', role: 'CUSTOMER',
      },
    });

    const customer2 = await this.prisma.user.create({
      data: {
        email: 'customer2@example.com', password: hashedPassword,
        name: 'Dewi Lestari', phone: '081300000002', role: 'CUSTOMER',
      },
    });

    const driver1 = await this.prisma.driver.create({
      data: {
        userId: driverUser1.id, licenseNumber: 'SIM-A-12345678',
        licenseType: 'A', licenseExpiry: new Date('2026-12-31'),
        status: 'AVAILABLE', ratingAvg: 4.5, totalTrips: 120,
      },
    });

    const driver2 = await this.prisma.driver.create({
      data: {
        userId: driverUser2.id, licenseNumber: 'SIM-A-87654321',
        licenseType: 'A', licenseExpiry: new Date('2027-06-30'),
        status: 'AVAILABLE', ratingAvg: 4.8, totalTrips: 85,
      },
    });

    const cars: any[] = [];
    const carData = [
      { brand: 'Toyota', model: 'Avanza', year: 2023, plateNumber: 'B 1234 ABC', color: 'Putih', category: CarCategory.MPV, branchId: branchJakarta.id, dailyRate: 350000, seatCount: 7, transmission: 'AUTOMATIC', fuelType: 'BENSIN', odometer: 15000 },
      { brand: 'Honda', model: 'City', year: 2023, plateNumber: 'B 5678 DEF', color: 'Merah', category: CarCategory.SEDAN, branchId: branchJakarta.id, dailyRate: 400000, seatCount: 5, transmission: 'AUTOMATIC', fuelType: 'BENSIN', odometer: 8000 },
      { brand: 'Toyota', model: 'Fortuner', year: 2022, plateNumber: 'L 9012 GHI', color: 'Hitam', category: CarCategory.SUV, branchId: branchSurabaya.id, dailyRate: 800000, seatCount: 7, transmission: 'AUTOMATIC', fuelType: 'DIESEL', odometer: 25000 },
      { brand: 'Mitsubishi', model: 'Pajero Sport', year: 2023, plateNumber: 'L 3456 JKL', color: 'Silver', category: CarCategory.SUV, branchId: branchSurabaya.id, dailyRate: 850000, seatCount: 7, transmission: 'AUTOMATIC', fuelType: 'DIESEL', odometer: 12000 },
      { brand: 'Toyota', model: 'Hilux', year: 2022, plateNumber: 'B 7890 MNO', color: 'Putih', category: CarCategory.PICKUP, branchId: branchJakarta.id, dailyRate: 600000, seatCount: 5, transmission: 'MANUAL', fuelType: 'DIESEL', odometer: 40000 },
      { brand: 'Daihatsu', model: 'Xenia', year: 2023, plateNumber: 'B 2345 PQR', color: 'Abu-abu', category: CarCategory.MPV, branchId: branchJakarta.id, dailyRate: 300000, seatCount: 7, transmission: 'MANUAL', fuelType: 'BENSIN', odometer: 10000 },
      { brand: 'Toyota', model: 'Camry', year: 2023, plateNumber: 'L 6789 STU', color: 'Hitam', category: CarCategory.SEDAN, branchId: branchSurabaya.id, dailyRate: 700000, seatCount: 5, transmission: 'AUTOMATIC', fuelType: 'BENSIN', odometer: 5000 },
      { brand: 'Honda', model: 'CR-V', year: 2023, plateNumber: 'B 3344 YZA', color: 'Putih', category: CarCategory.SUV, branchId: branchJakarta.id, dailyRate: 750000, seatCount: 7, transmission: 'AUTOMATIC', fuelType: 'BENSIN', odometer: 7000 },
    ];

    for (const c of carData) {
      const car = await this.prisma.car.create({
        data: { ...c, status: 'AVAILABLE', imageUrls: [] } as any,
      });
      cars.push(car);
    }

    const booking1 = await this.prisma.booking.create({
      data: {
        customerId: customer1.id, carId: cars[0].id, branchId: branchJakarta.id,
        startDate: new Date('2024-01-15T08:00:00Z'), endDate: new Date('2024-01-18T08:00:00Z'),
        pickupLocation: 'Kantor Cabang Jakarta', dropoffLocation: 'Bandara Soekarno-Hatta',
        status: 'COMPLETED', withDriver: false, totalAmount: 1050000,
      },
    });

    const booking2 = await this.prisma.booking.create({
      data: {
        customerId: customer2.id, carId: cars[2].id, driverId: driver2.id,
        branchId: branchSurabaya.id,
        startDate: new Date('2024-02-01T07:00:00Z'), endDate: new Date('2024-02-05T17:00:00Z'),
        pickupLocation: 'Hotel Majapahit', dropoffLocation: 'Hotel Majapahit',
        status: 'COMPLETED', withDriver: true, totalAmount: 3200000,
      },
    });

    await this.prisma.payment.create({
      data: {
        bookingId: booking1.id, amount: 1050000, method: 'bank_transfer',
        midtransOrderId: `RENTAL-${booking1.id}-001`, status: 'PAID',
        paidAt: new Date('2024-01-14T15:30:00Z'),
      },
    });

    await this.prisma.payment.create({
      data: {
        bookingId: booking2.id, amount: 3200000, method: 'credit_card',
        midtransOrderId: `RENTAL-${booking2.id}-002`, status: 'PAID',
        paidAt: new Date('2024-01-31T10:00:00Z'),
      },
    });

    await this.prisma.invoice.create({
      data: {
        organizationId: organization.id, bookingId: booking1.id,
        invoiceNumber: 'INV-20240115-001',
        issueDate: new Date('2024-01-15'), dueDate: new Date('2024-01-29'),
        subtotal: 1050000, taxRate: 11, taxAmount: 115500, discount: 0,
        totalAmount: 1165500, status: 'PAID', paidAt: new Date('2024-01-14'),
        items: { create: [{ description: 'Sewa Toyota Avanza 3 hari', quantity: 3, unitPrice: 350000, amount: 1050000 }] },
      },
    });

    return {
      message: 'Database seeded successfully!',
      credentials: {
        admin: 'admin@caritahub.com / password123',
        manager: 'manager@caritahub.com / password123',
        staff: 'staff1@caritahub.com / password123',
        driver: 'driver1@caritahub.com / password123',
        customer: 'customer1@example.com / password123',
      },
    };
  }
}
