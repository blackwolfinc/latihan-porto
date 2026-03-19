import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Compliance')
@ApiBearerAuth()
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('regulations')
  @Public()
  @ApiOperation({ summary: 'Get all Indonesian rental regulation settings' })
  getRegulations() {
    return this.complianceService.getRegulations();
  }

  @Post('validate-booking')
  @ApiOperation({ summary: 'Validate booking parameters against regulations' })
  validateBooking(
    @Body()
    body: {
      startDate: string;
      endDate: string;
      carYear: number;
      carCategory: string;
      customerAge?: number;
      licenseSince?: string;
      withDriver: boolean;
    },
  ) {
    return this.complianceService.validateBooking({
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      carYear: body.carYear,
      carCategory: body.carCategory,
      customerAge: body.customerAge,
      licenseSince: body.licenseSince
        ? new Date(body.licenseSince)
        : undefined,
      withDriver: body.withDriver,
    });
  }

  @Post('calculate-cost')
  @ApiOperation({ summary: 'Calculate booking cost with Indonesian tax rules' })
  calculateCost(
    @Body()
    body: {
      dailyRate: number;
      days: number;
      withDriver: boolean;
      driverDailyRate?: number;
      carCategory: string;
      afterHoursPickup?: boolean;
      afterHoursDropoff?: boolean;
    },
  ) {
    return this.complianceService.calculateBookingCost(body);
  }

  @Post('calculate-overtime')
  @ApiOperation({ summary: 'Calculate overtime fees for late returns' })
  calculateOvertime(
    @Body()
    body: {
      endDate: string;
      actualReturnDate: string;
      dailyRate: number;
    },
  ) {
    return this.complianceService.calculateOvertime({
      endDate: new Date(body.endDate),
      actualReturnDate: new Date(body.actualReturnDate),
      dailyRate: body.dailyRate,
    });
  }
}
