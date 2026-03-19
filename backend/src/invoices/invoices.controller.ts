import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate invoice from a booking' })
  generate(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.generateFromBooking(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with pagination and filters' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'] })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by issue date start' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by issue date end' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.invoicesService.findAll({
      status,
      startDate,
      endDate,
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get invoice by booking ID' })
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.invoicesService.findByBooking(bookingId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice (status, notes, discount)' })
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, dto);
  }

  @Patch(':id/send')
  @ApiOperation({ summary: 'Mark invoice as SENT' })
  markAsSent(@Param('id') id: string) {
    return this.invoicesService.markAsSent(id);
  }

  @Patch(':id/mark-paid')
  @ApiOperation({ summary: 'Mark invoice as PAID' })
  markAsPaid(@Param('id') id: string) {
    return this.invoicesService.markAsPaid(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate or return PDF URL for invoice' })
  generatePdf(@Param('id') id: string) {
    return this.invoicesService.generatePdf(id);
  }
}
