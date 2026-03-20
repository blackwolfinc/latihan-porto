import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateInvoiceTemplateDto } from './dto/update-invoice-template.dto';

@Injectable()
export class InvoiceTemplatesService {
  constructor(private prisma: PrismaService) {}

  async getByOrganization(organizationId: string) {
    return this.prisma.invoiceTemplate.findUnique({
      where: { organizationId },
    });
  }

  async createOrUpdate(organizationId: string, dto: UpdateInvoiceTemplateDto) {
    const { companyName, additionalBanks, ...rest } = dto;
    const data = {
      ...rest,
      companyName,
      ...(additionalBanks !== undefined ? { additionalBanks: additionalBanks as any } : {}),
    };
    return this.prisma.invoiceTemplate.upsert({
      where: { organizationId },
      update: data,
      create: {
        organizationId,
        companyName: companyName || 'My Company',
        ...rest,
        ...(additionalBanks !== undefined ? { additionalBanks: additionalBanks as any } : {}),
      },
    });
  }

  async updateLogo(organizationId: string, logoUrl: string) {
    return this.prisma.invoiceTemplate.update({
      where: { organizationId },
      data: { logoUrl },
    });
  }

  async updateSignature(organizationId: string, dto: {
    signatureName?: string;
    signatureTitle?: string;
    signatureImageUrl?: string;
    stampImageUrl?: string;
  }) {
    return this.prisma.invoiceTemplate.update({
      where: { organizationId },
      data: dto,
    });
  }

  async updateBankInfo(organizationId: string, dto: {
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    bankBranch?: string;
    additionalBanks?: any[];
  }) {
    return this.prisma.invoiceTemplate.update({
      where: { organizationId },
      data: dto,
    });
  }

  async generateInvoiceNumber(organizationId: string): Promise<string> {
    const template = await this.getByOrganization(organizationId);
    const prefix = template?.invoicePrefix || 'INV';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const count = await this.prisma.invoice.count({
      where: {
        organizationId,
        createdAt: { gte: todayStart },
      },
    });
    const seq = String(count + 1).padStart(3, '0');

    return `${prefix}-${date}-${seq}`;
  }

  async getPreviewData(organizationId: string) {
    const template = await this.getByOrganization(organizationId);
    const sampleNumber = await this.generateInvoiceNumber(organizationId);

    return {
      template,
      sampleInvoice: {
        invoiceNumber: sampleNumber,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        customer: {
          name: 'Budi Santoso',
          address: 'Jl. Merdeka No. 45, Jakarta Pusat',
          phone: '0812-3456-7890',
          email: 'budi@email.com',
        },
        items: [
          { description: 'Sewa Toyota Avanza - 3 hari', qty: 3, unitPrice: 350000, amount: 1050000 },
          { description: 'Biaya Driver - 3 hari', qty: 3, unitPrice: 200000, amount: 600000 },
          { description: 'Asuransi perjalanan', qty: 1, unitPrice: 75000, amount: 75000 },
        ],
        subtotal: 1725000,
        discount: 0,
        taxRate: 11,
        taxAmount: 189750,
        total: 1914750,
      },
    };
  }
}
