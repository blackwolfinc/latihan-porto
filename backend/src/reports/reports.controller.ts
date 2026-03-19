import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Roles('ADMIN', 'MANAGER')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report by date range' })
  @ApiQuery({ name: 'startDate', required: true, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2024-12-31' })
  @ApiQuery({ name: 'branchId', required: false })
  getRevenue(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.reportsService.getRevenue({ startDate, endDate, branchId });
  }

  @Get('fleet-utilization')
  @ApiOperation({ summary: 'Get fleet utilization stats' })
  @ApiQuery({ name: 'branchId', required: false })
  getFleetUtilization(@Query('branchId') branchId?: string) {
    return this.reportsService.getFleetUtilization(branchId);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Get expenses report' })
  @ApiQuery({ name: 'startDate', required: true, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2024-12-31' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'category', required: false })
  getExpenses(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
    @Query('category') category?: string,
  ) {
    return this.reportsService.getExpenses({ startDate, endDate, branchId, category });
  }
}
