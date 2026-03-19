import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Midtrans Snap payment token' })
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(dto);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Midtrans payment notification webhook' })
  webhook(@Body() notification: any) {
    return this.paymentsService.handleWebhook(notification);
  }

  @Get()
  @ApiBearerAuth()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get all payments' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.findAll({ status, page: +page || 1, limit: +limit || 10 });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
