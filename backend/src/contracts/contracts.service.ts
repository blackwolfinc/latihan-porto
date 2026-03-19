import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async generate(dto: CreateContractDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        car: { select: { id: true, brand: true, model: true, plateNumber: true, dailyRate: true } },
        branch: { select: { id: true, name: true, address: true } },
        contract: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.contract) throw new BadRequestException('Contract already exists for this booking');

    const terms = dto.terms || this.generateTerms(booking);

    return this.prisma.contract.create({
      data: {
        bookingId: dto.bookingId,
        terms,
      },
      include: {
        booking: {
          select: {
            id: true, startDate: true, endDate: true, totalAmount: true,
            customer: { select: { id: true, name: true } },
            car: { select: { id: true, brand: true, model: true, plateNumber: true } },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
            car: { select: { id: true, brand: true, model: true, plateNumber: true, dailyRate: true } },
            branch: { select: { id: true, name: true, address: true } },
          },
        },
      },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async findByBooking(bookingId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
            car: { select: { id: true, brand: true, model: true, plateNumber: true } },
            branch: { select: { id: true, name: true, address: true } },
          },
        },
      },
    });
    if (!contract) throw new NotFoundException('Contract not found for this booking');
    return contract;
  }

  async sign(id: string, signatureUrl: string) {
    const contract = await this.findOne(id);
    if (contract.signedAt) throw new BadRequestException('Contract already signed');

    return this.prisma.contract.update({
      where: { id },
      data: {
        signedAt: new Date(),
        signatureUrl,
      },
      include: {
        booking: {
          select: {
            id: true,
            customer: { select: { id: true, name: true } },
            car: { select: { id: true, brand: true, model: true } },
          },
        },
      },
    });
  }

  async updatePdf(id: string, pdfUrl: string) {
    await this.findOne(id);
    return this.prisma.contract.update({
      where: { id },
      data: { pdfUrl },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contract.delete({ where: { id } });
  }

  private generateTerms(booking: any): string {
    const startDate = new Date(booking.startDate).toLocaleDateString('id-ID');
    const endDate = new Date(booking.endDate).toLocaleDateString('id-ID');

    return `PERJANJIAN SEWA KENDARAAN

Pada hari ini, pihak penyewa ${booking.customer.name} menyepakati untuk menyewa kendaraan ${booking.car.brand} ${booking.car.model} (${booking.car.plateNumber}) dari cabang ${booking.branch.name} (${booking.branch.address}).

Periode sewa: ${startDate} sampai ${endDate}
Total biaya: Rp ${Number(booking.totalAmount).toLocaleString('id-ID')}

SYARAT DAN KETENTUAN:
1. Penyewa bertanggung jawab atas kerusakan kendaraan selama masa sewa.
2. Kendaraan harus dikembalikan dalam kondisi yang sama saat diterima.
3. Keterlambatan pengembalian akan dikenakan biaya tambahan.
4. Penyewa wajib mematuhi peraturan lalu lintas yang berlaku.
5. Kendaraan tidak boleh digunakan untuk kegiatan ilegal.
6. Bahan bakar menjadi tanggung jawab penyewa.
7. Penyewa wajib melaporkan segala kerusakan atau kecelakaan.`;
  }
}
