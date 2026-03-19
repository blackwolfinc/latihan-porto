import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create a new driver' })
  create(@Body() dto: CreateDriverDto) {
    return this.driversService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drivers' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.driversService.findAll({ status, search, page: +page || 1, limit: +limit || 10 });
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available drivers for a date' })
  @ApiQuery({ name: 'date', required: false })
  findAvailable(@Query('date') date?: string) {
    return this.driversService.findAvailable(date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get driver by ID' })
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update driver' })
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.driversService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Toggle driver status' })
  toggleStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.driversService.toggleStatus(id, status);
  }

  @Post(':id/documents')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Add driver document' })
  addDocument(
    @Param('id') id: string,
    @Body() data: { type: string; number: string; expiryDate: string; fileUrl: string },
  ) {
    return this.driversService.addDocument(id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete driver' })
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }
}
