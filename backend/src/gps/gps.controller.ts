import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GpsService } from './gps.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RequireFeature } from '../common/decorators/plan-feature.decorator';
import { PlanFeatureGuard } from '../common/guards/plan-feature.guard';

@ApiTags('GPS')
@ApiBearerAuth()
@UseGuards(PlanFeatureGuard)
@RequireFeature('gpsTracking')
@Controller('gps')
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Get('car/:id/history')
  @ApiOperation({ summary: 'Get GPS history for a car' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getCarHistory(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.gpsService.getCarHistory(id, { startDate, endDate, page: Number(page) || 1, limit: Number(limit) || 100 });
  }

  @Get('booking/:id/route')
  @ApiOperation({ summary: 'Get GPS route for a booking' })
  getBookingRoute(@Param('id') id: string) {
    return this.gpsService.getBookingRoute(id);
  }

  @Get('live')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Get latest positions of all rented cars' })
  getLatestPositions() {
    return this.gpsService.getLatestPositions();
  }
}
