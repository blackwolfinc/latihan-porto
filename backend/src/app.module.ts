import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BranchesModule } from './branches/branches.module';
import { CarsModule } from './cars/cars.module';
import { BookingsModule } from './bookings/bookings.module';
import { DriversModule } from './drivers/drivers.module';
import { CustomersModule } from './customers/customers.module';
import { PaymentsModule } from './payments/payments.module';
import { GpsModule } from './gps/gps.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { FuelModule } from './fuel/fuel.module';
import { InspectionsModule } from './inspections/inspections.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ContractsModule } from './contracts/contracts.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BranchesModule,
    CarsModule,
    BookingsModule,
    DriversModule,
    CustomersModule,
    PaymentsModule,
    GpsModule,
    MaintenanceModule,
    FuelModule,
    InspectionsModule,
    ReviewsModule,
    ContractsModule,
    ReportsModule,
    NotificationsModule,
    UploadsModule,
  ],
})
export class AppModule {}
