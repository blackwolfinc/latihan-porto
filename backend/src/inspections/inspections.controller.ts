import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Inspections')
@ApiBearerAuth()
@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Create a new inspection' })
  create(@Body() dto: CreateInspectionDto) {
    return this.inspectionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inspections' })
  @ApiQuery({ name: 'carId', required: false })
  @ApiQuery({ name: 'bookingId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['PRE_RENTAL', 'POST_RENTAL'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('carId') carId?: string,
    @Query('bookingId') bookingId?: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.inspectionsService.findAll({ carId, bookingId, type, page: Number(page) || 1, limit: Number(limit) || 10 });
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get inspections for a booking' })
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.inspectionsService.findByBooking(bookingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inspection by ID' })
  findOne(@Param('id') id: string) {
    return this.inspectionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Update inspection' })
  update(@Param('id') id: string, @Body() dto: UpdateInspectionDto) {
    return this.inspectionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Delete inspection' })
  remove(@Param('id') id: string) {
    return this.inspectionsService.remove(id);
  }
}
