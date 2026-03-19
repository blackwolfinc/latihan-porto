import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
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

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create branches
  const branchJakarta = await prisma.branch.create({
    data: {
      name: 'Cabang Jakarta Pusat',
      address: 'Jl. Sudirman No. 1, Jakarta Pusat',
      city: 'Jakarta',
      phone: '021-5551234',
      lat: -6.2088,
      lng: 106.8456,
    },
  });

  const branchBandung = await prisma.branch.create({
    data: {
      name: 'Cabang Bandung',
      address: 'Jl. Asia Afrika No. 50, Bandung',
      city: 'Bandung',
      phone: '022-4201234',
      lat: -6.9175,
      lng: 107.6191,
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
    },
  });

  console.log('Branches created');

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@rental.com',
      password: hashedPassword,
      name: 'Super Admin',
      phone: '081200000001',
      role: 'ADMIN',
      branchId: branchJakarta.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@rental.com',
      password: hashedPassword,
      name: 'Budi Santoso',
      phone: '081200000002',
      role: 'MANAGER',
      branchId: branchJakarta.id,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@rental.com',
      password: hashedPassword,
      name: 'Siti Rahayu',
      phone: '081200000003',
      role: 'STAFF',
      branchId: branchJakarta.id,
    },
  });

  const driverUser1 = await prisma.user.create({
    data: {
      email: 'driver1@rental.com',
      password: hashedPassword,
      name: 'Ahmad Supir',
      phone: '081200000004',
      role: 'DRIVER',
      branchId: branchJakarta.id,
    },
  });

  const driverUser2 = await prisma.user.create({
    data: {
      email: 'driver2@rental.com',
      password: hashedPassword,
      name: 'Joko Antar',
      phone: '081200000005',
      role: 'DRIVER',
      branchId: branchBandung.id,
    },
  });

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

  console.log('Users created');

  // Create drivers
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

  console.log('Drivers created');

  // Create driver documents
  await prisma.driverDocument.create({
    data: {
      driverId: driver1.id,
      type: 'SIM',
      number: 'SIM-A-12345678',
      expiryDate: new Date('2026-12-31'),
      fileUrl: '/uploads/drivers/sim-driver1.jpg',
    },
  });

  await prisma.driverDocument.create({
    data: {
      driverId: driver1.id,
      type: 'KTP',
      number: '3201012345678901',
      expiryDate: new Date('2030-01-01'),
      fileUrl: '/uploads/drivers/ktp-driver1.jpg',
    },
  });

  // Create cars
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
      model: 'Brio',
      year: 2023,
      plateNumber: 'B 5678 DEF',
      color: 'Merah',
      category: 'SEDAN',
      status: 'AVAILABLE',
      branchId: branchJakarta.id,
      dailyRate: 250000,
      imageUrls: ['/uploads/cars/brio-1.jpg'],
      seatCount: 5,
      transmission: 'AUTOMATIC',
      fuelType: 'BENSIN',
      odometer: 8000,
      description: 'Honda Brio 2023, irit dan nyaman untuk dalam kota.',
    },
  });

  const car3 = await prisma.car.create({
    data: {
      brand: 'Toyota',
      model: 'Fortuner',
      year: 2022,
      plateNumber: 'D 9012 GHI',
      color: 'Hitam',
      category: 'SUV',
      status: 'AVAILABLE',
      branchId: branchBandung.id,
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
      model: 'HiAce',
      year: 2022,
      plateNumber: 'B 7890 MNO',
      color: 'Putih',
      category: 'BUS',
      status: 'AVAILABLE',
      branchId: branchJakarta.id,
      dailyRate: 1200000,
      imageUrls: ['/uploads/cars/hiace-1.jpg'],
      seatCount: 16,
      transmission: 'MANUAL',
      fuelType: 'DIESEL',
      odometer: 40000,
      description: 'Toyota HiAce Commuter, untuk rombongan besar.',
    },
  });

  const car6 = await prisma.car.create({
    data: {
      brand: 'Mercedes-Benz',
      model: 'E-Class',
      year: 2023,
      plateNumber: 'B 1111 LUX',
      color: 'Hitam',
      category: 'LUXURY',
      status: 'AVAILABLE',
      branchId: branchJakarta.id,
      dailyRate: 2500000,
      imageUrls: ['/uploads/cars/eclass-1.jpg'],
      seatCount: 5,
      transmission: 'AUTOMATIC',
      fuelType: 'BENSIN',
      odometer: 5000,
      description: 'Mercedes-Benz E300, kendaraan premium untuk acara penting.',
    },
  });

  console.log('Cars created');

  // Create car documents
  await prisma.carDocument.create({
    data: {
      carId: car1.id,
      type: 'STNK',
      number: 'STNK-B1234ABC',
      expiryDate: new Date('2028-03-15'),
      fileUrl: '/uploads/documents/stnk-car1.jpg',
    },
  });

  await prisma.carDocument.create({
    data: {
      carId: car1.id,
      type: 'INSURANCE',
      number: 'INS-001-2024',
      expiryDate: new Date('2025-01-15'),
      fileUrl: '/uploads/documents/insurance-car1.pdf',
    },
  });

  await prisma.carDocument.create({
    data: {
      carId: car5.id,
      type: 'KIR',
      number: 'KIR-B7890MNO',
      expiryDate: new Date('2025-06-30'),
      fileUrl: '/uploads/documents/kir-car5.jpg',
    },
  });

  console.log('Car documents created');

  // Create bookings
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
      branchId: branchBandung.id,
      startDate: new Date('2024-02-01T07:00:00Z'),
      endDate: new Date('2024-02-05T17:00:00Z'),
      pickupLocation: 'Hotel Savoy Homann Bandung',
      dropoffLocation: 'Hotel Savoy Homann Bandung',
      status: 'COMPLETED',
      withDriver: true,
      totalAmount: 3200000,
      notes: 'Tour Bandung 5 hari dengan driver',
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      carId: car2.id,
      branchId: branchJakarta.id,
      startDate: new Date('2024-03-10T08:00:00Z'),
      endDate: new Date('2024-03-12T08:00:00Z'),
      pickupLocation: 'Kantor Cabang Jakarta Pusat',
      dropoffLocation: 'Kantor Cabang Jakarta Pusat',
      status: 'CONFIRMED',
      withDriver: false,
      totalAmount: 500000,
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      customerId: customer3.id,
      carId: car4.id,
      driverId: driver1.id,
      branchId: branchSurabaya.id,
      startDate: new Date('2024-03-15T06:00:00Z'),
      endDate: new Date('2024-03-20T18:00:00Z'),
      pickupLocation: 'Bandara Juanda Surabaya',
      dropoffLocation: 'Bandara Juanda Surabaya',
      status: 'PENDING',
      withDriver: true,
      totalAmount: 4250000,
      notes: 'Road trip Jawa Timur',
    },
  });

  const booking5 = await prisma.booking.create({
    data: {
      customerId: customer2.id,
      carId: car6.id,
      branchId: branchJakarta.id,
      startDate: new Date('2024-03-20T10:00:00Z'),
      endDate: new Date('2024-03-21T22:00:00Z'),
      pickupLocation: 'Hotel Indonesia Kempinski',
      dropoffLocation: 'Hotel Indonesia Kempinski',
      status: 'PENDING',
      withDriver: true,
      totalAmount: 2500000,
      notes: 'Acara pernikahan',
    },
  });

  console.log('Bookings created');

  // Create payments
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
      amount: 500000,
      midtransOrderId: `RENTAL-${booking3.id}-003`,
      status: 'PENDING',
      snapToken: 'mock-snap-token-003',
    },
  });

  console.log('Payments created');

  // Create GPS logs
  const gpsData = [
    { carId: car1.id, bookingId: booking1.id, lat: -6.2088, lng: 106.8456, speed: 0, heading: 0 },
    { carId: car1.id, bookingId: booking1.id, lat: -6.2100, lng: 106.8500, speed: 40, heading: 90 },
    { carId: car1.id, bookingId: booking1.id, lat: -6.1800, lng: 106.7800, speed: 60, heading: 270 },
    { carId: car1.id, bookingId: booking1.id, lat: -6.1256, lng: 106.6558, speed: 80, heading: 300 },
    { carId: car3.id, bookingId: booking2.id, lat: -6.9175, lng: 107.6191, speed: 0, heading: 0 },
    { carId: car3.id, bookingId: booking2.id, lat: -6.8700, lng: 107.5900, speed: 50, heading: 45 },
  ];

  for (const gps of gpsData) {
    await prisma.gpsLog.create({ data: gps });
  }

  console.log('GPS logs created');

  // Create maintenance records
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
      vendor: 'Bengkel Toyota Resmi Bandung',
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

  console.log('Maintenance records created');

  // Create fuel logs
  await prisma.fuelLog.create({
    data: {
      carId: car1.id,
      driverId: null,
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

  // Create inspections
  await prisma.inspection.create({
    data: {
      bookingId: booking1.id,
      carId: car1.id,
      type: 'PRE_RENTAL',
      inspectorId: staff.id,
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
      inspectorId: staff.id,
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
      inspectorId: staff.id,
      exteriorStatus: 'Kondisi sangat baik',
      interiorStatus: 'Bersih dan wangi',
      engineStatus: 'Performa mesin optimal',
      damagePhotos: [],
    },
  });

  console.log('Inspections created');

  // Create reviews
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

  // Create contracts
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
      terms: 'Perjanjian sewa kendaraan Toyota Fortuner dengan driver untuk 5 hari perjalanan Bandung.',
      signedAt: new Date('2024-02-01T06:30:00Z'),
      signatureUrl: '/uploads/signatures/sig-booking2.png',
    },
  });

  console.log('Contracts created');

  // Create notifications
  const notifications = [
    { userId: customer1.id, title: 'Booking Dikonfirmasi', body: 'Booking Toyota Avanza Anda telah dikonfirmasi.', type: 'BOOKING_CONFIRMED' },
    { userId: customer1.id, title: 'Pembayaran Berhasil', body: 'Pembayaran sebesar Rp 1.050.000 telah diterima.', type: 'PAYMENT_SUCCESS' },
    { userId: customer2.id, title: 'Booking Selesai', body: 'Perjalanan Anda dengan Fortuner telah selesai. Terima kasih!', type: 'BOOKING_COMPLETED' },
    { userId: admin.id, title: 'Booking Baru', body: 'Ada booking baru dari Rizki Pratama untuk Pajero Sport.', type: 'NEW_BOOKING' },
    { userId: manager.id, title: 'Maintenance Reminder', body: 'Toyota Avanza (B 1234 ABC) jadwal servis berikutnya: Juli 2024.', type: 'MAINTENANCE_REMINDER' },
    { userId: customer2.id, title: 'Jangan Lupa Review', body: 'Bagikan pengalaman Anda menyewa Mercedes-Benz E-Class.', type: 'REVIEW_REMINDER', isRead: false },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }

  console.log('Notifications created');

  // Create expenses
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
      branchId: branchBandung.id,
      category: 'Sewa Kantor',
      amount: 15000000,
      description: 'Sewa kantor cabang Bandung bulan Februari',
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
  console.log('Seeding completed successfully!');
  console.log('\nDefault credentials:');
  console.log('Admin:    admin@rental.com / password123');
  console.log('Manager:  manager@rental.com / password123');
  console.log('Staff:    staff@rental.com / password123');
  console.log('Driver:   driver1@rental.com / password123');
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
