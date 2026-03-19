import { Injectable } from '@nestjs/common';

@Injectable()
export class ComplianceService {
  // Indonesian rental regulations
  private readonly REGULATIONS = {
    // Jam operasional standar rental
    OPERATIONAL_HOURS: { start: 6, end: 22 }, // 06:00 - 22:00 WIB

    // Minimum rental duration (jam)
    MIN_RENTAL_HOURS: 12,

    // Overtime rate (per jam setelah masa sewa)
    OVERTIME_RATE_PERCENT: 10, // 10% dari tarif harian per jam overtime

    // Maximum overtime sebelum dianggap perpanjangan hari
    MAX_OVERTIME_HOURS: 3,

    // Denda keterlambatan per hari
    LATE_RETURN_PENALTY_PERCENT: 25, // 25% dari tarif harian per hari keterlambatan

    // Batas usia kendaraan untuk rental (tahun)
    MAX_VEHICLE_AGE: 10,

    // Minimum usia penyewa (tahun)
    MIN_RENTER_AGE: 21,

    // Minimum usia SIM penyewa (tahun memiliki SIM)
    MIN_LICENSE_AGE: 1,

    // Jenis SIM yang diperlukan per kategori
    REQUIRED_LICENSE: {
      SEDAN: 'A',
      SUV: 'A',
      MPV: 'A',
      PICKUP: 'A',
      VAN: 'B1',
      BUS: 'B2',
      LUXURY: 'A',
    } as Record<string, string>,

    // PPN rate
    TAX_RATE: 11, // PPN 11%

    // Uang jaminan / deposit
    DEPOSIT_RATES: {
      SEDAN: 500000,
      SUV: 750000,
      MPV: 500000,
      PICKUP: 500000,
      VAN: 1000000,
      BUS: 2000000,
      LUXURY: 2000000,
    } as Record<string, number>,

    // Batas kecepatan (km/h) - untuk GPS monitoring
    SPEED_LIMIT: {
      CITY: 50,
      HIGHWAY: 100,
      RESIDENTIAL: 30,
    },
  };

  getRegulations() {
    return this.REGULATIONS;
  }

  // Validasi booking sesuai regulasi
  validateBooking(params: {
    startDate: Date;
    endDate: Date;
    carYear: number;
    carCategory: string;
    customerAge?: number;
    licenseSince?: Date;
    withDriver: boolean;
  }) {
    const errors: string[] = [];
    const warnings: string[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();

    // 1. Cek usia kendaraan
    const vehicleAge = currentYear - params.carYear;
    if (vehicleAge > this.REGULATIONS.MAX_VEHICLE_AGE) {
      warnings.push(
        `Kendaraan berusia ${vehicleAge} tahun, melebihi batas rekomendasi ${this.REGULATIONS.MAX_VEHICLE_AGE} tahun.`,
      );
    }

    // 2. Cek durasi minimum
    const durationHours =
      (params.endDate.getTime() - params.startDate.getTime()) /
      (1000 * 60 * 60);
    if (durationHours < this.REGULATIONS.MIN_RENTAL_HOURS) {
      errors.push(
        `Durasi sewa minimum adalah ${this.REGULATIONS.MIN_RENTAL_HOURS} jam.`,
      );
    }

    // 3. Cek jam pickup/dropoff (warning saja, masih boleh)
    const startHour = params.startDate.getHours();
    if (
      startHour < this.REGULATIONS.OPERATIONAL_HOURS.start ||
      startHour >= this.REGULATIONS.OPERATIONAL_HOURS.end
    ) {
      warnings.push(
        `Jam pengambilan (${startHour}:00) di luar jam operasional (${this.REGULATIONS.OPERATIONAL_HOURS.start}:00 - ${this.REGULATIONS.OPERATIONAL_HOURS.end}:00). Biaya tambahan mungkin berlaku.`,
      );
    }

    // 4. Cek usia penyewa (jika self-drive)
    if (!params.withDriver && params.customerAge) {
      if (params.customerAge < this.REGULATIONS.MIN_RENTER_AGE) {
        errors.push(
          `Penyewa harus berusia minimal ${this.REGULATIONS.MIN_RENTER_AGE} tahun untuk sewa lepas kunci.`,
        );
      }
    }

    // 5. Cek jenis SIM (jika self-drive)
    if (!params.withDriver) {
      const requiredLicense =
        this.REGULATIONS.REQUIRED_LICENSE[params.carCategory];
      if (requiredLicense) {
        warnings.push(
          `Penyewa wajib memiliki SIM ${requiredLicense} untuk kendaraan kategori ${params.carCategory}.`,
        );
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  // Hitung biaya overtime
  calculateOvertime(params: {
    endDate: Date;
    actualReturnDate: Date;
    dailyRate: number;
  }) {
    const overtimeMs =
      params.actualReturnDate.getTime() - params.endDate.getTime();
    if (overtimeMs <= 0)
      return {
        overtimeHours: 0,
        overtimeFee: 0,
        extraDays: 0,
        extraDaysFee: 0,
      };

    const overtimeHours = Math.ceil(overtimeMs / (1000 * 60 * 60));

    if (overtimeHours <= this.REGULATIONS.MAX_OVERTIME_HOURS) {
      // Charge per hour
      const hourlyRate =
        params.dailyRate * (this.REGULATIONS.OVERTIME_RATE_PERCENT / 100);
      return {
        overtimeHours,
        overtimeFee: hourlyRate * overtimeHours,
        extraDays: 0,
        extraDaysFee: 0,
      };
    } else {
      // Charge as extra days
      const extraDays = Math.ceil(overtimeHours / 24);
      const penaltyRate =
        params.dailyRate *
        (this.REGULATIONS.LATE_RETURN_PENALTY_PERCENT / 100);
      return {
        overtimeHours,
        overtimeFee: 0,
        extraDays,
        extraDaysFee: (params.dailyRate + penaltyRate) * extraDays,
      };
    }
  }

  // Hitung deposit berdasarkan kategori
  getDepositAmount(carCategory: string): number {
    return this.REGULATIONS.DEPOSIT_RATES[carCategory] || 500000;
  }

  // Hitung total biaya
  calculateBookingCost(params: {
    dailyRate: number;
    days: number;
    withDriver: boolean;
    driverDailyRate?: number;
    carCategory: string;
    afterHoursPickup?: boolean;
    afterHoursDropoff?: boolean;
  }) {
    const rentalCost = params.dailyRate * params.days;
    const driverCost = params.withDriver
      ? (params.driverDailyRate || 200000) * params.days
      : 0;
    const afterHoursFee =
      (params.afterHoursPickup ? 50000 : 0) +
      (params.afterHoursDropoff ? 50000 : 0);
    const subtotal = rentalCost + driverCost + afterHoursFee;
    const taxAmount = subtotal * (this.REGULATIONS.TAX_RATE / 100);
    const deposit = this.getDepositAmount(params.carCategory);
    const total = subtotal + taxAmount;

    return {
      rentalCost,
      driverCost,
      afterHoursFee,
      subtotal,
      taxRate: this.REGULATIONS.TAX_RATE,
      taxAmount,
      deposit,
      total,
      totalWithDeposit: total + deposit,
    };
  }
}
