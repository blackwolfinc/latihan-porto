import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class VerificationService {
  constructor(private prisma: PrismaService) {}

  // Submit KTP/SIM documents for verification
  async submitVerification(userId: string, dto: {
    ktpNumber?: string;
    ktpName?: string;
    ktpAddress?: string;
    ktpPhotoUrl?: string;
    simNumber?: string;
    simType?: string;
    simExpiryDate?: Date;
    simPhotoUrl?: string;
    selfiePhotoUrl?: string;
  }) {
    // Check if customer is blacklisted
    const blacklisted = await this.checkBlacklist(dto.ktpNumber, dto.simNumber);
    if (blacklisted) {
      throw new BadRequestException('Customer terdeteksi dalam daftar blacklist. Verifikasi ditolak.');
    }

    return this.prisma.customerVerification.upsert({
      where: { userId },
      update: { ...dto, verificationStatus: 'PENDING', riskScore: await this.calculateRiskScore(dto) },
      create: { userId, ...dto, riskScore: await this.calculateRiskScore(dto) },
    });
  }

  // Admin reviews and approves/rejects verification
  async reviewVerification(id: string, dto: {
    approved: boolean;
    rejectionReason?: string;
    verifiedBy: string;
  }) {
    return this.prisma.customerVerification.update({
      where: { id },
      data: {
        verificationStatus: dto.approved ? 'VERIFIED' : 'REJECTED',
        verifiedBy: dto.verifiedBy,
        verifiedAt: dto.approved ? new Date() : null,
        rejectionReason: dto.rejectionReason,
      },
    });
  }

  // Check if KTP/SIM is in blacklist
  async checkBlacklist(ktpNumber?: string, simNumber?: string) {
    if (!ktpNumber && !simNumber) return null;

    const conditions: any[] = [];
    if (ktpNumber) conditions.push({ ktpNumber, isActive: true });
    if (simNumber) conditions.push({ simNumber, isActive: true });

    return this.prisma.customerBlacklist.findFirst({
      where: { OR: conditions },
    });
  }

  // Calculate risk score (0-100)
  private async calculateRiskScore(dto: any): Promise<number> {
    let score = 0;

    // No KTP = high risk
    if (!dto.ktpNumber) score += 30;
    // No SIM = moderate risk
    if (!dto.simNumber) score += 20;
    // No selfie = moderate risk
    if (!dto.selfiePhotoUrl) score += 15;
    // SIM expired = high risk
    if (dto.simExpiryDate && new Date(dto.simExpiryDate) < new Date()) score += 25;
    // No address = minor risk
    if (!dto.ktpAddress) score += 10;

    return Math.min(score, 100);
  }

  // Get verification status for a user
  async getVerification(userId: string) {
    return this.prisma.customerVerification.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });
  }

  // Get all pending verifications (for admin)
  async getPendingVerifications(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.customerVerification.findMany({
        where: { verificationStatus: { in: ['PENDING', 'IN_REVIEW'] } },
        include: { user: { select: { id: true, name: true, email: true, phone: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.customerVerification.count({
        where: { verificationStatus: { in: ['PENDING', 'IN_REVIEW'] } },
      }),
    ]);
    return { data, total, page, limit };
  }

  // Get all verifications with optional status filter
  async getVerifications(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { verificationStatus: status as any } : {};
    const [data, total] = await Promise.all([
      this.prisma.customerVerification.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, phone: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.customerVerification.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  // Blacklist management
  async addToBlacklist(dto: {
    ktpNumber?: string;
    simNumber?: string;
    name: string;
    phone?: string;
    reason: string;
    description: string;
    reportedBy: string;
    expiresAt?: Date;
  }) {
    return this.prisma.customerBlacklist.create({ data: dto as any });
  }

  async getBlacklist(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.customerBlacklist.findMany({
        where: { isActive: true },
        include: { reporter: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.customerBlacklist.count({ where: { isActive: true } }),
    ]);
    return { data, total, page, limit };
  }

  async removeFromBlacklist(id: string) {
    return this.prisma.customerBlacklist.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Quick check before booking (returns risk assessment)
  async preBookingCheck(customerId: string) {
    const verification = await this.prisma.customerVerification.findUnique({
      where: { userId: customerId },
    });

    const result = {
      verified: verification?.verificationStatus === 'VERIFIED',
      ktpVerified: verification?.ktpVerified || false,
      simVerified: verification?.simVerified || false,
      riskScore: verification?.riskScore || 100,
      riskLevel: 'HIGH' as string,
      canBook: false,
      issues: [] as string[],
    };

    if (!verification) {
      result.issues.push('Customer belum melakukan verifikasi identitas');
      result.riskLevel = 'HIGH';
      result.canBook = false;
      return result;
    }

    if (verification.verificationStatus === 'REJECTED') {
      result.issues.push('Verifikasi identitas ditolak: ' + (verification.rejectionReason || 'Alasan tidak diketahui'));
      result.riskLevel = 'HIGH';
      result.canBook = false;
      return result;
    }

    if (verification.simExpiryDate && verification.simExpiryDate < new Date()) {
      result.issues.push('SIM sudah expired');
    }

    // Risk level based on score
    if (verification.riskScore <= 20) result.riskLevel = 'LOW';
    else if (verification.riskScore <= 50) result.riskLevel = 'MEDIUM';
    else result.riskLevel = 'HIGH';

    result.canBook = verification.verificationStatus === 'VERIFIED' && verification.riskScore <= 50;

    return result;
  }
}
