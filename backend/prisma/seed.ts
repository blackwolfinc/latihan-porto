import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data in correct order (respecting foreign keys)
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.gpsLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.carDocument.deleteMany();
  await prisma.driverDocument.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.car.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.organization.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ── Organization (Tenant) ───────────────────────────────────────
  const organization = await prisma.organization.create({
    data: {
      name: 'CaritaHub Rental',
      slug: 'caritahub-rental',
      address: 'Jl. Sudirman No. 1, Jakarta Pusat',
      city: 'Jakarta',
      phone: '021-5551234',
      email: 'info@caritahub.com',
      website: 'https://caritahub.com',
      taxId: '01.234.567.8-012.000',
      plan: 'STANDARD',
      isActive: true,
    },
  });

  console.log('Organization created');

  // ── Branches ──────────────────────────────────────────────────────
  const branchJakarta = await prisma.branch.create({
    data: {
      name: 'Cabang Jakarta Pusat',
      address: 'Jl. Sudirman No. 1, Jakarta Pusat',
      city: 'Jakarta',
      phone: '021-5551234',
      lat: -6.2088,
      lng: 106.8456,
      organizationId: organization.id,
    },
  });

  const branchSurabaya = await prisma.branch.create({
    data: {
      name: 'Cabang Surabaya',
      address: 'Jl. Tunjungan No. 10, Surabaya',
      city: 'Surabaya',
      phone: '031-5321234',
      lat: -7.2575,
      lng: 112.7521,
      organizationId: organization.id,
    },
  });

  console.log('Branches created');

  // ── Users ─────────────────────────────────────────────────────────

  // 1 Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@caritahub.com',
      password: hashedPassword,
      name: 'Super Admin',
      phone: '081200000001',
      role: 'ADMIN',
      branchId: branchJakarta.id,
      organizationId: organization.id,
    },
  });

  // 1 Manager
  const manager = await prisma.user.create({
    data: {
      email: 'manager@caritahub.com',
      password: hashedPassword,
      name: 'Budi Santoso',
      phone: '081200000002',
      role: 'MANAGER',
      branchId: branchJakarta.id,
      organizationId: organization.id,
    },
  });

  // 3 Staff
  const staff1 = await prisma.user.create({
    data: {
      email: 'staff1@caritahub.com',
      password: hashedPassword,
      name: 'Siti Rahayu',
      phone: '081200000003',
      role: 'STAFF',
      branchId: branchJakarta.id,
      organizationId: organization.id,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: 'staff2@caritahub.com',
      password: hashedPassword,
      name: 'Dian Purnama',
      phone: '081200000004',
      role: 'STAFF',
      branchId: branchSurabaya.id,
      organizationId: organization.id,
    },
  });

  const staff3 = await prisma.user.create({
    data: {
      email: 'staff3@caritahub.com',
      password: hashedPassword,
      name: 'Hendra Kusuma',
      phone: '081200000005',
      role: 'STAFF',
      branchId: branchJakarta.id,
      organizationId: organization.id,
    },
  });

  // 5 Driver users
  const driverUser1 = await prisma.user.create({
    data: {
      email: 'driver1@caritahub.com',
      password: hashedPassword,
      name: 'Ahmad Supir',
      phone: '081200000006',
      role: 'DRIVER',
      branchId: branchJakarta.id,
      organizationId: organization.id,
    },
  });

  const driverUser2 = await prisma.user.create({
    data: {
      email: 'driver2@caritahub.com',
      password: hashedPassword,
      name: 'Joko Antar',
      phone: '081200000007',
      role: 'DRIVER',
      branchId: branchSurabaya.id,
      organizationId: organization.id,
    },
  });

  const driverUser3 = await prisma.user.create({
    data: {
      email: 'driver3@caritahub.com',
      password: hashedPassword,
      name: 'Rudi Hartono',
      phone: '081200000008',
      role: 'DRIVER',
      branchId: branchJakarta.id,
      organizationId: organization.id,
    },
  });

  const driverUser4 = await prisma.user.create({
    data: {
      email: 'driver4@caritahub.com',
      password: hashedPassword,
      name: 'Bambang Setiawan',
      phone: '081200000009',
      role: 'DRIVER',
      branchId: branchSurabaya.id,
      organizationId: organization.id,
    },
  });

  const driverUser5 = await prisma.user.create({
    data: {
      email: 'driver5@caritahub.com',
      password: hashedPassword,
      name: 'Eko Prasetyo',
      phone: '081200000010',
      role: 'DRIVER',
      branchId: branchJakarta.id,
      organizationId: organization.id,
    },
  });

  // 5 Customer users
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer1@example.com',
      password: hashedPassword,
      name: 'Andi Wijaya',
      phone: '081300000001',
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'customer2@example.com',
      password: hashedPassword,
      name: 'Dewi Lestari',
      phone: '081300000002',
      role: 'CUSTOMER',
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: 'customer3@example.com',
      password: hashedPassword,
      name: 'Rizki Pratama',
      phone: '081300000003',
      role: 'CUSTOMER',
    },
  });

  const customer4 = await prisma.user.create({
    data: {
      email: 'customer4@example.com',
      password: hashedPassword,
      name: 'Fitri Handayani',
      phone: '081300000004',
      role: 'CUSTOMER',
    },
  });

  const customer5 = await prisma.user.create({
    data: {
      email: 'customer5@example.com',
      password: hashedPassword,
      name: 'Wahyu Nugroho',
      phone: '081300000005',
      role: 'CUSTOMER',
    },
  });

  console.log('Users created');

  // ── Drivers ───────────────────────────────────────────────────────
  const driver1 = await prisma.driver.create({
    data: {
      userId: driverUser1.id,
      licenseNumber: 'SIM-A-12345678',
      licenseType: 'A',
      licenseExpiry: new Date('2026-12-31'),
      status: 'AVAILABLE',
      ratingAvg: 4.5,
      totalTrips: 120,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      userId: driverUser2.id,
      licenseNumber: 'SIM-A-87654321',
      licenseType: 'A',
      licenseExpiry: new Date('2027-06-30'),
      status: 'AVAILABLE',
      ratingAvg: 4.8,
      totalTrips: 85,
    },
  });

  const driver3 = await prisma.driver.create({
    data: {
      userId: driverUser3.id,
      licenseNumber: 'SIM-A-11223344',
      licenseType: 'A',
      licenseExpiry: new Date('2027-03-15'),
      status: 'AVAILABLE',
      ratingAvg: 4.2,
      totalTrips: 60,
    },
  });

  const driver4 = await prisma.driver.create({
    data: {
      userId: driverUser4.id,
      licenseNumber: 'SIM-B1-55667788',
      licenseType: 'B1',
      licenseExpiry: new Date('2026-09-20'),
      status: 'AVAILABLE',
      ratingAvg: 4.6,
      totalTrips: 95,
    },
  });

  const driver5 = await prisma.driver.create({
    data: {
      userId: driverUser5.id,
      licenseNumber: 'SIM-A-99001122',
      licenseType: 'A',
      licenseExpiry: new Date('2027-11-10'),
      status: 'OFF_DUTY',
      ratingAvg: 4.0,
      totalTrips: 30,
    },
  });

  console.log('Drivers created');

  // ── Driver Documents ──────────────────────────────────────────────
  const driverDocData = [
    { driverId: driver1.id, type: 'SIM' as const, number: 'SIM-A-12345678', expiryDate: new Date('2026-12-31'), fileUrl: '/uploads/drivers/sim-driver1.jpg' },
    { driverId: driver1.id, type: 'KTP' as const, number: '3201012345678901', expiryDate: new Date('2030-01-01'), fileUrl: '/uploads/drivers/ktp-driver1.jpg' },
    { driverId: driver2.id, type: 'SIM' as const, number: 'SIM-A-87654321', expiryDate: new Date('2027-06-30'), fileUrl: '/uploads/drivers/sim-driver2.jpg' },
    { driverId: driver3.id, type: 'SIM' as const, number: 'SIM-A-11223344', expiryDate: new Date('2027-03-15'), fileUrl: '/uploads/drivers/sim-driver3.jpg' },
    { driverId: driver4.id, type: 'SIM' as const, number: 'SIM-B1-55667788', expiryDate: new Date('2026-09-20'), fileUrl: '/uploads/drivers/sim-driver4.jpg' },
    { driverId: driver5.id, type: 'SIM' as const, number: 'SIM-A-99001122', expiryDate: new Date('2027-11-10'), fileUrl: '/uploads/drivers/sim-driver5.jpg' },
  ];

  for (const doc of driverDocData) {
    await prisma.driverDocument.create({ data: doc });
  }

  console.log('Driver documents created');

  // ── Cars (10 cars: mix of Sedan, SUV, MPV, Pickup) ────────────────
  const car1 = await prisma.car.create({
    data: {
      brand: 'Toyota',
      model: 'Avanza',
      year: 2023,
      plateNumber: 'B 1234 ABC',
      color: 'Putih',
      category: 'MPV',
      status: 'AVAILABLE',
      branchId: branchJakarta.id,
      dailyRate: 350000,
      imageUrls: ['/uploads/cars/avanza-1.jpg', '/uploads/cars/avanza-2.jpg'],
      seatCount: 7,
      transmission: 'AUTOMATIC',
      fuelType: 'BENSIN',
      odometer: 15000,
      description: 'Toyota Avanza 2023, kondisi prima, cocok untuk keluarga.',
    },
  });

  const car2 = await prisma.car.create({
    data: {
      brand: 'Honda',
      model: 'City',
      year: 2023,
      plateNumber: 'B 5678 DEF',
      color: 'Merah',
      category: 'SEDAN',
      status: 'AVAILABLE',
      branchId: branchJakarta.id,
      dailyRate: 400000,
      imageUrls: ['/uploads/cars/city-1.jpg'],
      seatCount: 5,
      transmission: 'AUTOMATIC',
      fuelType: 'BENSIN',
      odometer: 8000,
      description: 'Honda City 2023, sedan nyaman untuk perjalanan bisnis.',
    },
  });

  const car3 = await prisma.car.create({
    data: {
      brand: 'Toyota',
      model: 'Fortuner',
      year: 2022,
      plateNumber: 'L 9012 GHI',
      color: 'Hitam',
      category: 'SUV',
      status: 'AVAILABLE',
      branchId: branchSurabaya.id,
      dailyRate: 800000,
      imageUrls: ['/uploads/cars/fortuner-1.jpg'],
      seatCount: 7,
      transmission: 'AUTOMATIC',
      fuelType: 'DIESEL',
      odometer: 25000,
      description: 'Toyota Fortuner VRZ, cocok untuk perjalanan jauh.',
    },
  });

  const car4 = await prisma.car.create({
    data: {
      brand: 'Mitsubishi',
      model: 'Pajero Sport',
      year: 2023,
      plateNumber: 'L 3456 JKL',
      color: 'Silver',
      category: 'SUV',
      status: 'AVAILABLE',
      branchId: branchSurabaya.id,
      dailyRate: 850000,
      imageUrls: ['/uploads/cars/pajero-1.jpg'],
      seatCount: 7,
      transmission: 'AUTOMATIC',
      fuelType: 'DIESEL',
      odometer: 12000,
      description: 'Mitsubishi Pajero Sport Dakar, performa tangguh.',
    },
  });

  const car5 = await prisma.car.create({
    data: {
      brand: 'Toyota',
      model: 'Hilux',
      year: 2022,
      plateNumber: 'B 7890 MNO',
      color: 'Putih',
      category: 'PICKUP',
      status: 'AVAILABLE',
      branchId: branchJakarta.id,
      dailyRate: 600000,
      imageUrls: ['/uploads/cars/hilux-1.jpg'],
      seatCount: 5,
      transmission: 'MANUAL',
      fuelType: 'DIESEL',
      odometer: 40000,
      description: 'Toyota Hilux Double Cabin, cocok untuk angkutan berat.',
    },
  });

  const car6 = await prisma.car.create({
    data: {
      brand: 'Daihatsu',
      model: 'Xenia',
      year: 2023,
      plateNumber: 'B 2345 PQR',
      color: 'Abu-abu',
      category: 'MPV',
      status: 'AVAILABLE',
      branchId: branchJakarta.id,
      dailyRate: 300000,
      imageUrls: ['/uploads/cars/xenia-1.jpg'],
      seatCount: 7,
      transmission: 'MANUAL',
      fuelType: 'BENSIN',
      odometer: 10000,
      description: 'Daihatsu Xenia 2023, ekonomis untuk keluarga.',
    },
  });

  const car7 = await prisma.car.create({
    data: {
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      plateNumber: 'L 6789 STU',
      color: 'Hitam',
      category: 'SEDAN',
      status: 'AVAILABLE',
      branchId: branchSurabaya.id,
      dailyRate: 700000,
      imageUrls: ['/uploads/cars/camry-1.jpg'],
      seatCount: 5,
      transmission: 'AUTOMATIC',
      fuelType: 'BENSIN',
      odometer: 5000,
      description: 'Toyota Camry 2023, sedan premium untuk eksekutif.',
    },
  });

  const car8 = await prisma.car.create({
    data: {
      brand: 'Mitsubishi',
      model: 'Triton',
      year: 2022,
      plateNumber: 'L 1122 VWX',
      color: 'Hitam',
      category: 'PICKUP',
      status: 'AVAILABLE',
      branchId: branchSurabaya.id,
      dailyRate: 550000,
      imageUrls: ['/uploads/cars/triton-1.jpg'],
      seatCount: 5,
      transmission: 'MANUAL',
      fuelType: 'DIESEL',
      odometer: 35000,
      description: 'Mitsubishi Triton, pickup tangguh untuk segala medan.',
    },
  });

  const car9 = await prisma.car.create({
    data: {
      brand: 'Honda',
      model: 'CR-V',
      year: 2023,
      plateNumber: 'B 3344 YZA',
      color: 'Putih',
      category: 'SUV',
      status: 'AVAILABLE',
      branchId: branchJakarta.id,
      dailyRate: 750000,
      imageUrls: ['/uploads/cars/crv-1.jpg'],
      seatCount: 7,
      transmission: 'AUTOMATIC',
      fuelType: 'BENSIN',
      odometer: 7000,
      description: 'Honda CR-V 2023, SUV nyaman dengan fitur modern.',
    },
  });

  const car10 = await prisma.car.create({
    data: {
      brand: 'Suzuki',
      model: 'Ertiga',
      year: 2023,
      plateNumber: 'L 5566 BCD',
      color: 'Biru',
      category: 'MPV',
      status: 'MAINTENANCE',
      branchId: branchSurabaya.id,
      dailyRate: 320000,
      imageUrls: ['/uploads/cars/ertiga-1.jpg'],
      seatCount: 7,
      transmission: 'AUTOMATIC',
      fuelType: 'BENSIN',
      odometer: 18000,
      description: 'Suzuki Ertiga 2023, MPV lincah dan irit bahan bakar.',
    },
  });

  console.log('Cars created (10 cars: Sedan, SUV, MPV, Pickup mix)');

  // ── Car Documents ─────────────────────────────────────────────────
  const carDocData = [
    { carId: car1.id, type: 'STNK' as const, number: 'STNK-B1234ABC', expiryDate: new Date('2028-03-15'), fileUrl: '/uploads/documents/stnk-car1.jpg' },
    { carId: car1.id, type: 'INSURANCE' as const, number: 'INS-001-2024', expiryDate: new Date('2025-01-15'), fileUrl: '/uploads/documents/insurance-car1.pdf' },
    { carId: car3.id, type: 'STNK' as const, number: 'STNK-L9012GHI', expiryDate: new Date('2027-06-20'), fileUrl: '/uploads/documents/stnk-car3.jpg' },
    { carId: car5.id, type: 'STNK' as const, number: 'STNK-B7890MNO', expiryDate: new Date('2027-08-10'), fileUrl: '/uploads/documents/stnk-car5.jpg' },
    { carId: car5.id, type: 'KIR' as const, number: 'KIR-B7890MNO', expiryDate: new Date('2025-06-30'), fileUrl: '/uploads/documents/kir-car5.jpg' },
  ];

  for (const doc of carDocData) {
    await prisma.carDocument.create({ data: doc });
  }

  console.log('Car documents created');

  // ── Bookings (5 with various statuses) ────────────────────────────
  const booking1 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      carId: car1.id,
      branchId: branchJakarta.id,
      startDate: new Date('2024-01-15T08:00:00Z'),
      endDate: new Date('2024-01-18T08:00:00Z'),
      pickupLocation: 'Kantor Cabang Jakarta Pusat',
      dropoffLocation: 'Bandara Soekarno-Hatta',
      status: 'COMPLETED',
      withDriver: false,
      totalAmount: 1050000,
      notes: 'Perjalanan bisnis ke Tangerang',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      customerId: customer2.id,
      carId: car3.id,
      driverId: driver2.id,
      branchId: branchSurabaya.id,
      startDate: new Date('2024-02-01T07:00:00Z'),
      endDate: new Date('2024-02-05T17:00:00Z'),
      pickupLocation: 'Hotel Majapahit Surabaya',
      dropoffLocation: 'Hotel Majapahit Surabaya',
      status: 'COMPLETED',
      withDriver: true,
      totalAmount: 3200000,
      notes: 'Tour Jawa Timur 5 hari dengan driver',
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      customerId: customer3.id,
      carId: car2.id,
      branchId: branchJakarta.id,
      startDate: new Date('2024-03-10T08:00:00Z'),
      endDate: new Date('2024-03-12T08:00:00Z'),
      pickupLocation: 'Kantor Cabang Jakarta Pusat',
      dropoffLocation: 'Kantor Cabang Jakarta Pusat',
      status: 'CONFIRMED',
      withDriver: false,
      totalAmount: 800000,
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      customerId: customer4.id,
      carId: car4.id,
      driverId: driver4.id,
      branchId: branchSurabaya.id,
      startDate: new Date('2024-03-15T06:00:00Z'),
      endDate: new Date('2024-03-20T18:00:00Z'),
      pickupLocation: 'Bandara Juanda Surabaya',
      dropoffLocation: 'Bandara Juanda Surabaya',
      status: 'ACTIVE',
      withDriver: true,
      totalAmount: 4250000,
      notes: 'Road trip Jawa Timur',
    },
  });

  const booking5 = await prisma.booking.create({
    data: {
      customerId: customer5.id,
      carId: car7.id,
      branchId: branchSurabaya.id,
      startDate: new Date('2024-03-20T10:00:00Z'),
      endDate: new Date('2024-03-21T22:00:00Z'),
      pickupLocation: 'Cabang Surabaya',
      dropoffLocation: 'Cabang Surabaya',
      status: 'PENDING',
      withDriver: false,
      totalAmount: 700000,
      notes: 'Acara keluarga',
    },
  });

  console.log('Bookings created');

  // ── Payments (3) ──────────────────────────────────────────────────
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      amount: 1050000,
      method: 'bank_transfer',
      midtransTransactionId: 'TXN-001-MOCK',
      midtransOrderId: `RENTAL-${booking1.id}-001`,
      status: 'PAID',
      paidAt: new Date('2024-01-14T15:30:00Z'),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      amount: 3200000,
      method: 'credit_card',
      midtransTransactionId: 'TXN-002-MOCK',
      midtransOrderId: `RENTAL-${booking2.id}-002`,
      status: 'PAID',
      paidAt: new Date('2024-01-31T10:00:00Z'),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking3.id,
      amount: 800000,
      midtransOrderId: `RENTAL-${booking3.id}-003`,
      status: 'PENDING',
      snapToken: 'mock-snap-token-003',
    },
  });

  console.log('Payments created');

  // ── GPS Logs ──────────────────────────────────────────────────────
  const gpsData = [
    { carId: car1.id, bookingId: booking1.id, lat: -6.2088, lng: 106.8456, speed: 0, heading: 0 },
    { carId: car1.id, bookingId: booking1.id, lat: -6.2100, lng: 106.8500, speed: 40, heading: 90 },
    { carId: car1.id, bookingId: booking1.id, lat: -6.1800, lng: 106.7800, speed: 60, heading: 270 },
    { carId: car1.id, bookingId: booking1.id, lat: -6.1256, lng: 106.6558, speed: 80, heading: 300 },
    { carId: car3.id, bookingId: booking2.id, lat: -7.2575, lng: 112.7521, speed: 0, heading: 0 },
    { carId: car3.id, bookingId: booking2.id, lat: -7.2700, lng: 112.7900, speed: 50, heading: 45 },
  ];

  for (const gps of gpsData) {
    await prisma.gpsLog.create({ data: gps });
  }

  console.log('GPS logs created');

  // ── Maintenance Records ───────────────────────────────────────────
  await prisma.maintenanceRecord.create({
    data: {
      carId: car1.id,
      type: 'ROUTINE',
      description: 'Ganti oli mesin dan filter oli',
      cost: 450000,
      date: new Date('2024-01-10'),
      nextDueDate: new Date('2024-07-10'),
      odometer: 15000,
      vendor: 'Bengkel Auto2000',
    },
  });

  await prisma.maintenanceRecord.create({
    data: {
      carId: car3.id,
      type: 'REPAIR',
      description: 'Ganti kampas rem depan',
      cost: 800000,
      date: new Date('2024-01-20'),
      odometer: 25000,
      vendor: 'Bengkel Toyota Resmi Surabaya',
    },
  });

  await prisma.maintenanceRecord.create({
    data: {
      carId: car5.id,
      type: 'INSPECTION',
      description: 'Inspeksi KIR tahunan',
      cost: 250000,
      date: new Date('2024-02-01'),
      nextDueDate: new Date('2025-02-01'),
      odometer: 40000,
      vendor: 'Dinas Perhubungan',
    },
  });

  await prisma.maintenanceRecord.create({
    data: {
      carId: car10.id,
      type: 'REPAIR',
      description: 'Ganti timing belt dan water pump',
      cost: 2500000,
      date: new Date('2024-03-01'),
      odometer: 18000,
      vendor: 'Bengkel Suzuki Resmi Surabaya',
    },
  });

  console.log('Maintenance records created');

  // ── Fuel Logs ─────────────────────────────────────────────────────
  await prisma.fuelLog.create({
    data: {
      carId: car1.id,
      liters: 40,
      cost: 520000,
      odometer: 15200,
      date: new Date('2024-01-15'),
      fuelType: 'BENSIN',
    },
  });

  await prisma.fuelLog.create({
    data: {
      carId: car3.id,
      driverId: driver2.id,
      liters: 55,
      cost: 759000,
      odometer: 25300,
      date: new Date('2024-02-01'),
      fuelType: 'DIESEL',
    },
  });

  await prisma.fuelLog.create({
    data: {
      carId: car3.id,
      driverId: driver2.id,
      liters: 50,
      cost: 690000,
      odometer: 25800,
      date: new Date('2024-02-03'),
      fuelType: 'DIESEL',
    },
  });

  console.log('Fuel logs created');

  // ── Inspections ───────────────────────────────────────────────────
  await prisma.inspection.create({
    data: {
      bookingId: booking1.id,
      carId: car1.id,
      type: 'PRE_RENTAL',
      inspectorId: staff1.id,
      exteriorStatus: 'Baik, tidak ada goresan baru',
      interiorStatus: 'Bersih, semua jok dalam kondisi baik',
      engineStatus: 'Mesin berjalan normal, oli cukup',
      notes: 'Kendaraan siap disewakan',
      damagePhotos: [],
    },
  });

  await prisma.inspection.create({
    data: {
      bookingId: booking1.id,
      carId: car1.id,
      type: 'POST_RENTAL',
      inspectorId: staff1.id,
      exteriorStatus: 'Baik, ada debu perjalanan',
      interiorStatus: 'Perlu dibersihkan, ada sampah kecil',
      engineStatus: 'Normal',
      notes: 'Perlu cuci sebelum disewakan kembali',
      damagePhotos: [],
    },
  });

  await prisma.inspection.create({
    data: {
      bookingId: booking2.id,
      carId: car3.id,
      type: 'PRE_RENTAL',
      inspectorId: staff2.id,
      exteriorStatus: 'Kondisi sangat baik',
      interiorStatus: 'Bersih dan wangi',
      engineStatus: 'Performa mesin optimal',
      damagePhotos: [],
    },
  });

  console.log('Inspections created');

  // ── Reviews ───────────────────────────────────────────────────────
  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      customerId: customer1.id,
      rating: 5,
      comment: 'Mobil bersih dan nyaman, pelayanan cepat!',
    },
  });

  await prisma.review.create({
    data: {
      bookingId: booking2.id,
      customerId: customer2.id,
      driverId: driver2.id,
      rating: 5,
      comment: 'Driver sangat ramah dan berpengalaman. Perjalanan menyenangkan!',
    },
  });

  console.log('Reviews created');

  // ── Contracts ─────────────────────────────────────────────────────
  await prisma.contract.create({
    data: {
      bookingId: booking1.id,
      terms: 'Perjanjian sewa kendaraan Toyota Avanza untuk 3 hari. Penyewa bertanggung jawab atas kendaraan selama masa sewa.',
      signedAt: new Date('2024-01-15T07:30:00Z'),
      signatureUrl: '/uploads/signatures/sig-booking1.png',
    },
  });

  await prisma.contract.create({
    data: {
      bookingId: booking2.id,
      terms: 'Perjanjian sewa kendaraan Toyota Fortuner dengan driver untuk 5 hari perjalanan Jawa Timur.',
      signedAt: new Date('2024-02-01T06:30:00Z'),
      signatureUrl: '/uploads/signatures/sig-booking2.png',
    },
  });

  console.log('Contracts created');

  // ── Notifications ─────────────────────────────────────────────────
  const notifications = [
    { userId: customer1.id, title: 'Booking Dikonfirmasi', body: 'Booking Toyota Avanza Anda telah dikonfirmasi.', type: 'BOOKING_CONFIRMED' },
    { userId: customer1.id, title: 'Pembayaran Berhasil', body: 'Pembayaran sebesar Rp 1.050.000 telah diterima.', type: 'PAYMENT_SUCCESS' },
    { userId: customer2.id, title: 'Booking Selesai', body: 'Perjalanan Anda dengan Fortuner telah selesai. Terima kasih!', type: 'BOOKING_COMPLETED' },
    { userId: admin.id, title: 'Booking Baru', body: 'Ada booking baru dari Fitri Handayani untuk Pajero Sport.', type: 'NEW_BOOKING' },
    { userId: manager.id, title: 'Maintenance Reminder', body: 'Toyota Avanza (B 1234 ABC) jadwal servis berikutnya: Juli 2024.', type: 'MAINTENANCE_REMINDER' },
    { userId: customer5.id, title: 'Booking Menunggu Pembayaran', body: 'Silakan selesaikan pembayaran untuk booking Toyota Camry Anda.', type: 'PAYMENT_PENDING' },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }

  console.log('Notifications created');

  // ── Expenses ──────────────────────────────────────────────────────
  await prisma.expense.create({
    data: {
      branchId: branchJakarta.id,
      carId: car1.id,
      category: 'Cuci Mobil',
      amount: 75000,
      description: 'Cuci mobil setelah booking selesai',
      date: new Date('2024-01-18'),
    },
  });

  await prisma.expense.create({
    data: {
      branchId: branchJakarta.id,
      category: 'Listrik',
      amount: 2500000,
      description: 'Tagihan listrik kantor bulan Januari',
      date: new Date('2024-01-25'),
    },
  });

  await prisma.expense.create({
    data: {
      branchId: branchSurabaya.id,
      category: 'Sewa Kantor',
      amount: 15000000,
      description: 'Sewa kantor cabang Surabaya bulan Februari',
      date: new Date('2024-02-01'),
    },
  });

  await prisma.expense.create({
    data: {
      branchId: branchSurabaya.id,
      carId: car4.id,
      category: 'Asuransi',
      amount: 5000000,
      description: 'Pembayaran asuransi Pajero Sport tahunan',
      date: new Date('2024-02-15'),
    },
  });

  console.log('Expenses created');

  // ── Invoices ────────────────────────────────────────────────────
  // Invoice 1: Completed booking (booking1 - Toyota Avanza, 3 days, no driver)
  const invoice1 = await prisma.invoice.create({
    data: {
      organizationId: organization.id,
      bookingId: booking1.id,
      invoiceNumber: 'INV-20240115-001',
      issueDate: new Date('2024-01-15T08:00:00Z'),
      dueDate: new Date('2024-01-29T08:00:00Z'),
      subtotal: 1050000,
      taxRate: 11,
      taxAmount: 115500,
      discount: 0,
      totalAmount: 1165500,
      status: 'PAID',
      paidAt: new Date('2024-01-14T15:30:00Z'),
      notes: 'Pembayaran lunas via bank transfer',
      items: {
        create: [
          {
            description: 'Sewa Mobil Toyota Avanza (B 1234 ABC)',
            quantity: 3,
            unitPrice: 350000,
            amount: 1050000,
          },
        ],
      },
    },
  });

  // Invoice 2: Completed booking with driver (booking2 - Fortuner, 5 days, with driver)
  const invoice2 = await prisma.invoice.create({
    data: {
      organizationId: organization.id,
      bookingId: booking2.id,
      invoiceNumber: 'INV-20240201-001',
      issueDate: new Date('2024-02-01T07:00:00Z'),
      dueDate: new Date('2024-02-15T07:00:00Z'),
      subtotal: 5000000,
      taxRate: 11,
      taxAmount: 550000,
      discount: 0,
      totalAmount: 5550000,
      status: 'PAID',
      paidAt: new Date('2024-01-31T10:00:00Z'),
      notes: 'Tour Jawa Timur dengan driver - dibayar via credit card',
      items: {
        create: [
          {
            description: 'Sewa Mobil Toyota Fortuner (L 9012 GHI)',
            quantity: 5,
            unitPrice: 800000,
            amount: 4000000,
          },
          {
            description: 'Biaya Driver - Joko Antar',
            quantity: 5,
            unitPrice: 200000,
            amount: 1000000,
          },
        ],
      },
    },
  });

  // Invoice 3: Confirmed booking (booking3 - Honda City, 2 days, no driver) - SENT
  const invoice3 = await prisma.invoice.create({
    data: {
      organizationId: organization.id,
      bookingId: booking3.id,
      invoiceNumber: 'INV-20240310-001',
      issueDate: new Date('2024-03-10T08:00:00Z'),
      dueDate: new Date('2024-03-24T08:00:00Z'),
      subtotal: 800000,
      taxRate: 11,
      taxAmount: 88000,
      discount: 0,
      totalAmount: 888000,
      status: 'SENT',
      notes: 'Invoice dikirim ke email pelanggan',
      items: {
        create: [
          {
            description: 'Sewa Mobil Honda City (B 5678 DEF)',
            quantity: 2,
            unitPrice: 400000,
            amount: 800000,
          },
        ],
      },
    },
  });

  console.log('Invoices created');

  console.log('\n========================================');
  console.log('Seeding completed successfully!');
  console.log('========================================\n');
  console.log('Default credentials:');
  console.log('Admin:    admin@caritahub.com / password123');
  console.log('Manager:  manager@caritahub.com / password123');
  console.log('Staff:    staff1@caritahub.com / password123');
  console.log('Driver:   driver1@caritahub.com / password123');
  console.log('Customer: customer1@example.com / password123');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
