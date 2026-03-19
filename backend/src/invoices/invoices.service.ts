import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvoicesService {
  private readonly DRIVER_DAILY_RATE = 200000;

  constructor(private prisma: PrismaService) {}

  async generateFromBooking(dto: CreateInvoiceDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        car: true,
        driver: { include: { user: { select: { name: true } } } },
        customer: { select: { id: true, name: true, email: true } },
        branch: { include: { organization: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const existingInvoice = await this.prisma.invoice.findFirst({
      where: { bookingId: dto.bookingId },
    });
    if (existingInvoice) {
      throw new BadRequestException('Invoice already exists for this booking');
    }

    const organizationId = booking.branch.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Branch is not associated with an organization');
    }

    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const rentalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    const dailyRate = Number(booking.car.dailyRate);
    const rentalAmount = rentalDays * dailyRate;

    const items: { description: string; quantity: number; unitPrice: number; amount: number }[] = [];

    items.push({
      description: `Sewa Mobil ${booking.car.brand} ${booking.car.model} (${booking.car.plateNumber})`,
      quantity: rentalDays,
      unitPrice: dailyRate,
      amount: rentalAmount,
    });

    let driverAmount = 0;
    if (booking.withDriver && booking.driver) {
      driverAmount = rentalDays * this.DRIVER_DAILY_RATE;
      items.push({
        description: `Biaya Driver - ${booking.driver.user.name}`,
        quantity: rentalDays,
        unitPrice: this.DRIVER_DAILY_RATE,
        amount: driverAmount,
      });
    }

    const subtotal = rentalAmount + driverAmount;
    const discount = dto.discount || 0;
    const taxableAmount = subtotal - discount;
    const taxRate = 11;
    const taxAmount = Math.round(taxableAmount * taxRate / 100);
    const totalAmount = taxableAmount + taxAmount;

    const invoiceNumber = await this.generateInvoiceNumber();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const invoice = await this.prisma.invoice.create({
      data: {
        organizationId,
        bookingId: booking.id,
        invoiceNumber,
        dueDate,
        subtotal: new Decimal(subtotal),
        taxRate: new Decimal(taxRate),
        taxAmount: new Decimal(taxAmount),
        discount: new Decimal(discount),
        totalAmount: new Decimal(totalAmount),
        notes: dto.notes,
        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice),
            amount: new Decimal(item.amount),
          })),
        },
      },
      include: {
        items: true,
        booking: {
          include: {
            car: { select: { id: true, brand: true, model: true, plateNumber: true } },
            customer: { select: { id: true, name: true, email: true } },
          },
        },
        organization: { select: { id: true, name: true, address: true, phone: true, email: true, taxId: true } },
      },
    });

    return invoice;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `INV-${dateStr}-`;

    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSeq = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0', 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(3, '0')}`;
  }

  async findAll(query: {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, startDate, endDate, search, page = 1, limit = 10 } = query;
    const where: any = {};

    if (status) where.status = status;

    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = new Date(startDate);
      if (endDate) where.issueDate.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { booking: { customer: { name: { contains: search, mode: 'insensitive' } } } },
        { booking: { car: { brand: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: true,
          booking: {
            include: {
              car: { select: { id: true, brand: true, model: true, plateNumber: true } },
              customer: { select: { id: true, name: true, email: true, phone: true } },
            },
          },
          organization: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        booking: {
          include: {
            car: true,
            customer: { select: { id: true, name: true, email: true, phone: true } },
            driver: { include: { user: { select: { name: true, phone: true } } } },
            branch: { select: { id: true, name: true, address: true, city: true } },
          },
        },
        organization: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async findByBooking(bookingId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { bookingId },
      include: {
        items: true,
        booking: {
          include: {
            car: { select: { id: true, brand: true, model: true, plateNumber: true } },
            customer: { select: { id: true, name: true, email: true } },
          },
        },
        organization: { select: { id: true, name: true, address: true, phone: true, email: true, taxId: true } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found for this booking');
    }

    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.findOne(id);

    const data: any = {};
    if (dto.status) data.status = dto.status;
    if (dto.notes !== undefined) data.notes = dto.notes;

    if (dto.discount !== undefined) {
      const subtotal = Number(invoice.subtotal);
      const taxRate = Number(invoice.taxRate);
      const discount = dto.discount;
      const taxableAmount = subtotal - discount;
      const taxAmount = Math.round(taxableAmount * taxRate / 100);
      const totalAmount = taxableAmount + taxAmount;

      data.discount = new Decimal(discount);
      data.taxAmount = new Decimal(taxAmount);
      data.totalAmount = new Decimal(totalAmount);
    }

    return this.prisma.invoice.update({
      where: { id },
      data,
      include: {
        items: true,
        booking: {
          include: {
            car: { select: { id: true, brand: true, model: true, plateNumber: true } },
            customer: { select: { id: true, name: true, email: true } },
          },
        },
        organization: { select: { id: true, name: true } },
      },
    });
  }

  async markAsSent(id: string) {
    const invoice = await this.findOne(id);

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only draft invoices can be sent');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'SENT' },
      include: {
        items: true,
        booking: {
          include: {
            car: { select: { id: true, brand: true, model: true, plateNumber: true } },
            customer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  async markAsPaid(id: string) {
    const invoice = await this.findOne(id);

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already paid');
    }

    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException('Cannot mark a cancelled invoice as paid');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
      include: {
        items: true,
        booking: {
          include: {
            car: { select: { id: true, brand: true, model: true, plateNumber: true } },
            customer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  async generatePdf(id: string) {
    const invoice = await this.findOne(id);

    const pdfUrl = `/invoices/pdf/${invoice.invoiceNumber}.pdf`;

    await this.prisma.invoice.update({
      where: { id },
      data: { pdfUrl },
    });

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      pdfUrl,
      message: 'PDF generated successfully',
    };
  }
}
