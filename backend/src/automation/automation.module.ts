import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomationService } from './automation.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [AutomationService],
})
export class AutomationModule {}
