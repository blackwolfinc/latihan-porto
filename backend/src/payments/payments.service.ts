import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private snap: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const midtransClient = require('midtrans-client');
    this.snap = new midtransClient.Snap({
      isProduction: configService.get('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: configService.get('MIDTRANS_SERVER_KEY'),
      clientKey: configService.get('MIDTRANS_CLIENT_KEY'),
    });
  }

  async createPayment(dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        car: { select: { brand: true, model: true } },
        payment: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.payment?.status === 'PAID') throw new BadRequestException('Booking already paid');

    const orderId = `RENTAL-${booking.id}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(booking.totalAmount),
      },
      customer_details: {
        first_name: booking.customer.name,
        email: booking.customer.email,
        phone: booking.customer.phone || '',
      },
      item_details: [
        {
          id: booking.carId,
          price: Number(booking.totalAmount),
          quantity: 1,
          name: `Rental ${booking.car.brand} ${booking.car.model}`,
        },
      ],
    };

    const transaction = await this.snap.createTransaction(parameter);

    const payment = await this.prisma.payment.upsert({
      where: { bookingId: dto.bookingId },
      update: {
        midtransOrderId: orderId,
        snapToken: transaction.token,
        snapRedirectUrl: transaction.redirect_url,
        amount: booking.totalAmount,
        status: 'PENDING',
      },
      create: {
        bookingId: dto.bookingId,
        amount: booking.totalAmount,
        midtransOrderId: orderId,
        snapToken: transaction.token,
        snapRedirectUrl: transaction.redirect_url,
        status: 'PENDING',
      },
    });

    return {
      payment,
      snapToken: transaction.token,
      snapRedirectUrl: transaction.redirect_url,
    };
  }

  async handleWebhook(notification: any) {
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    const hash = crypto
      .createHash('sha512')
      .update(`${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`)
      .digest('hex');

    if (hash !== notification.signature_key) {
      throw new BadRequestException('Invalid signature');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { midtransOrderId: notification.order_id },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    let status: string = payment.status;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    if (transactionStatus === 'capture') {
      status = fraudStatus === 'accept' ? 'PAID' : 'FAILED';
    } else if (transactionStatus === 'settlement') {
      status = 'PAID';
    } else if (['cancel', 'deny'].includes(transactionStatus)) {
      status = 'FAILED';
    } else if (transactionStatus === 'expire') {
      status = 'EXPIRED';
    } else if (transactionStatus === 'refund') {
      status = 'REFUNDED';
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: status as any,
        method: notification.payment_type,
        midtransTransactionId: notification.transaction_id,
        paidAt: status === 'PAID' ? new Date() : undefined,
      },
    });

    if (status === 'PAID') {
      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });
    }

    if (status === 'EXPIRED' || status === 'FAILED') {
      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CANCELLED' },
      });
    }

    return updatedPayment;
  }

  async findAll(query: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 10 } = query;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          booking: {
            include: {
              customer: { select: { id: true, name: true, email: true } },
              car: { select: { id: true, brand: true, model: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            customer: { select: { id: true, name: true, email: true } },
            car: true,
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
