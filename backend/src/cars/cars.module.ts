import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [SubscriptionModule],
  controllers: [CarsController],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
