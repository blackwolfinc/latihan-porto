import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(private prisma: PrismaService) {}

  // 1. Auto-check bookings that should start today -> change CONFIRMED -> ACTIVE
  @Cron(CronExpression.EVERY_HOUR)
  async autoActivateBookings() {
    const now = new Date();
    const bookings = await this.prisma.booking.updateMany({
      where: {
        status: 'CONFIRMED',
        startDate: { lte: now },
      },
      data: { status: 'ACTIVE' },
    });
    if (bookings.count > 0) {
      this.logger.log(`Auto-activated ${bookings.count} bookings`);
    }
  }

  // 2. Auto-check bookings that ended -> change ACTIVE -> COMPLETED (with 2hr grace period)
  @Cron(CronExpression.EVERY_HOUR)
  async autoCompleteBookings() {
    const gracePeriod = new Date();
    gracePeriod.setHours(gracePeriod.getHours() - 2);
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: gracePeriod },
      },
    });
    for (const booking of bookings) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'COMPLETED' },
      });
      // Free up the car
      await this.prisma.car.update({
        where: { id: booking.carId },
        data: { status: 'AVAILABLE' },
      });
      // Free up driver
      if (booking.driverId) {
        await this.prisma.driver.update({
          where: { id: booking.driverId },
          data: { status: 'AVAILABLE' },
        });
      }
      // Create notification for customer
      await this.prisma.notification.create({
        data: {
          userId: booking.customerId,
          title: 'Rental Selesai',
          body: 'Masa sewa Anda telah berakhir. Terima kasih telah menggunakan CaritaHub Rental.',
          type: 'BOOKING',
        },
      });
    }
    if (bookings.length > 0) {
      this.logger.log(`Auto-completed ${bookings.length} bookings`);
    }
  }

  // 3. Auto-expire unpaid bookings after 24 hours
  @Cron(CronExpression.EVERY_HOUR)
  async autoExpireUnpaidBookings() {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    const bookings = await this.prisma.booking.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lte: oneDayAgo },
      },
      data: { status: 'CANCELLED' },
    });
    if (bookings.count > 0) {
      this.logger.log(`Auto-expired ${bookings.count} unpaid bookings`);
    }
  }

  // 4. Document expiry reminders (STNK, SIM, KIR, Insurance) - 30 days before
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkDocumentExpiry() {
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    // Check car documents
    const expiringCarDocs = await this.prisma.carDocument.findMany({
      where: {
        expiryDate: { lte: thirtyDaysLater, gte: new Date() },
      },
      include: { car: true },
    });

    for (const doc of expiringCarDocs) {
      const daysLeft = Math.ceil(
        (doc.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      // Notify admin users
      const admins = await this.prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'MANAGER'] } },
      });
      for (const admin of admins) {
        await this.prisma.notification.create({
          data: {
            userId: admin.id,
            title: `Dokumen ${doc.type} Akan Expired`,
            body: `${doc.type} mobil ${doc.car.plateNumber} (${doc.car.brand} ${doc.car.model}) akan expired dalam ${daysLeft} hari (${doc.expiryDate.toLocaleDateString('id-ID')}).`,
            type: 'DOCUMENT_EXPIRY',
            data: { carId: doc.carId, documentId: doc.id },
          },
        });
      }
    }

    // Check driver documents
    const expiringDriverDocs = await this.prisma.driverDocument.findMany({
      where: {
        expiryDate: { lte: thirtyDaysLater, gte: new Date() },
      },
      include: { driver: { include: { user: true } } },
    });

    for (const doc of expiringDriverDocs) {
      const daysLeft = Math.ceil(
        (doc.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      await this.prisma.notification.create({
        data: {
          userId: doc.driver.userId,
          title: `${doc.type} Anda Akan Expired`,
          body: `${doc.type} Anda akan expired dalam ${daysLeft} hari. Segera perpanjang.`,
          type: 'DOCUMENT_EXPIRY',
        },
      });
    }
    this.logger.log(
      `Checked document expiry: ${expiringCarDocs.length} car docs, ${expiringDriverDocs.length} driver docs`,
    );
  }

  // 5. Maintenance reminders - cars approaching next service date
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkMaintenanceSchedule() {
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const upcomingMaintenance = await this.prisma.maintenanceRecord.findMany({
      where: {
        nextDueDate: { lte: sevenDaysLater, gte: new Date() },
      },
      include: { car: true },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MANAGER', 'STAFF'] } },
    });

    for (const record of upcomingMaintenance) {
      for (const admin of admins) {
        await this.prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Jadwal Maintenance',
            body: `Mobil ${record.car.plateNumber} perlu ${record.type.toLowerCase()} sebelum ${record.nextDueDate?.toLocaleDateString('id-ID')}.`,
            type: 'MAINTENANCE',
          },
        });
      }
    }
  }

  // 6. Auto-generate invoice when booking is completed
  @Cron(CronExpression.EVERY_30_MINUTES)
  async autoGenerateInvoices() {
    const completedWithoutInvoice = await this.prisma.booking.findMany({
      where: {
        status: 'COMPLETED',
        invoices: { none: {} },
      },
      include: {
        car: true,
        driver: { include: { user: true } },
        customer: true,
        branch: true,
      },
    });

    for (const booking of completedWithoutInvoice) {
      const days = Math.ceil(
        (booking.endDate.getTime() - booking.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const rentalAmount = Number(booking.car.dailyRate) * days;
      const driverAmount =
        booking.withDriver && booking.driver ? 200000 * days : 0;
      const subtotal = rentalAmount + driverAmount;
      const taxRate = 11;
      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      await this.prisma.invoice.create({
        data: {
          organizationId: booking.branch?.organizationId || '',
          bookingId: booking.id,
          invoiceNumber,
          dueDate,
          subtotal,
          taxRate,
          taxAmount,
          totalAmount,
          status: 'SENT',
          items: {
            create: [
              {
                description: `Sewa ${booking.car.brand} ${booking.car.model} (${booking.car.plateNumber}) - ${days} hari`,
                quantity: days,
                unitPrice: Number(booking.car.dailyRate),
                amount: rentalAmount,
              },
              ...(booking.withDriver
                ? [
                    {
                      description: `Biaya Driver - ${days} hari`,
                      quantity: days,
                      unitPrice: 200000,
                      amount: driverAmount,
                    },
                  ]
                : []),
            ],
          },
        },
      });
    }
  }

  // 7. Daily summary notification to admin at 7 AM
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async dailySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await this.prisma.booking.count({
      where: {
        OR: [
          { startDate: { gte: today, lt: tomorrow } },
          { endDate: { gte: today, lt: tomorrow } },
          { status: 'ACTIVE' },
        ],
      },
    });

    const availableCars = await this.prisma.car.count({
      where: { status: 'AVAILABLE' },
    });
    const availableDrivers = await this.prisma.driver.count({
      where: { status: 'AVAILABLE' },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MANAGER'] } },
    });

    for (const admin of admins) {
      await this.prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Ringkasan Harian',
          body: `Hari ini: ${todayBookings} booking aktif, ${availableCars} mobil tersedia, ${availableDrivers} driver tersedia.`,
          type: 'SYSTEM',
        },
      });
    }
  }

  // 8. Overdue booking alerts (rental belum dikembalikan)
  @Cron(CronExpression.EVERY_HOUR)
  async checkOverdueBookings() {
    const now = new Date();
    const overdueBookings = await this.prisma.booking.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lt: now },
      },
      include: { customer: true, car: true },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MANAGER'] } },
    });

    for (const booking of overdueBookings) {
      const hoursOverdue = Math.ceil(
        (now.getTime() - booking.endDate.getTime()) / (1000 * 60 * 60),
      );
      for (const admin of admins) {
        await this.prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Rental Overdue!',
            body: `${booking.car.plateNumber} (${booking.customer.name}) sudah melewati batas waktu ${hoursOverdue} jam. Segera tindak lanjuti.`,
            type: 'BOOKING_OVERDUE',
            data: { bookingId: booking.id },
          },
        });
      }

      // Notify customer
      await this.prisma.notification.create({
        data: {
          userId: booking.customerId,
          title: 'Waktu Sewa Telah Berakhir',
          body: `Waktu sewa mobil ${booking.car.brand} ${booking.car.model} telah berakhir. Segera kembalikan untuk menghindari biaya tambahan.`,
          type: 'BOOKING_OVERDUE',
        },
      });
    }
  }

  // 9. Invoice overdue check
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkOverdueInvoices() {
    const now = new Date();
    await this.prisma.invoice.updateMany({
      where: {
        status: 'SENT',
        dueDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    });
  }
}
