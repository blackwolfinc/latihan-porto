import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FuelService } from './fuel.service';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Fuel')
@ApiBearerAuth()
@Controller('fuel')
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'STAFF', 'DRIVER')
  @ApiOperation({ summary: 'Create fuel log' })
  create(@Body() dto: CreateFuelDto) {
    return this.fuelService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all fuel logs' })
  @ApiQuery({ name: 'carId', required: false })
  @ApiQuery({ name: 'driverId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('carId') carId?: string,
    @Query('driverId') driverId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.fuelService.findAll({ carId, driverId, page: +page || 1, limit: +limit || 10 });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fuel log by ID' })
  findOne(@Param('id') id: string) {
    return this.fuelService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Update fuel log' })
  update(@Param('id') id: string, @Body() dto: UpdateFuelDto) {
    return this.fuelService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Delete fuel log' })
  remove(@Param('id') id: string) {
    return this.fuelService.remove(id);
  }
}
