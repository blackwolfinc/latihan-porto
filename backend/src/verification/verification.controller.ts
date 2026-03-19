import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VerificationService } from './verification.service';

@ApiTags('verification')
@ApiBearerAuth()
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit KTP/SIM documents for verification' })
  submitVerification(
    @Req() req: any,
    @Body() body: {
      ktpNumber?: string;
      ktpName?: string;
      ktpAddress?: string;
      ktpPhotoUrl?: string;
      simNumber?: string;
      simType?: string;
      simExpiryDate?: string;
      simPhotoUrl?: string;
      selfiePhotoUrl?: string;
    },
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.verificationService.submitVerification(userId, {
      ...body,
      simExpiryDate: body.simExpiryDate ? new Date(body.simExpiryDate) : undefined,
    });
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current user verification status' })
  getVerificationStatus(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.verificationService.getVerification(userId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'List pending verifications (admin)' })
  getPendingVerifications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.verificationService.getPendingVerifications(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('list')
  @ApiOperation({ summary: 'List all verifications with optional status filter (admin)' })
  getVerifications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.verificationService.getVerifications(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
    );
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Approve or reject a verification (admin)' })
  reviewVerification(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: {
      approved: boolean;
      rejectionReason?: string;
    },
  ) {
    const verifiedBy = req.user?.id || req.user?.sub;
    return this.verificationService.reviewVerification(id, {
      ...body,
      verifiedBy,
    });
  }

  @Get('pre-booking-check/:customerId')
  @ApiOperation({ summary: 'Pre-booking risk check for a customer' })
  preBookingCheck(@Param('customerId') customerId: string) {
    return this.verificationService.preBookingCheck(customerId);
  }

  @Get('blacklist')
  @ApiOperation({ summary: 'List blacklisted customers (admin)' })
  getBlacklist(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.verificationService.getBlacklist(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('blacklist')
  @ApiOperation({ summary: 'Add customer to blacklist (admin)' })
  addToBlacklist(
    @Req() req: any,
    @Body() body: {
      ktpNumber?: string;
      simNumber?: string;
      name: string;
      phone?: string;
      reason: string;
      description: string;
      expiresAt?: string;
    },
  ) {
    const reportedBy = req.user?.id || req.user?.sub;
    return this.verificationService.addToBlacklist({
      ...body,
      reportedBy,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
  }

  @Delete('blacklist/:id')
  @ApiOperation({ summary: 'Remove customer from blacklist (admin)' })
  removeFromBlacklist(@Param('id') id: string) {
    return this.verificationService.removeFromBlacklist(id);
  }

  @Get('blacklist/check')
  @ApiOperation({ summary: 'Check if KTP/SIM is blacklisted' })
  checkBlacklist(
    @Query('ktpNumber') ktpNumber?: string,
    @Query('simNumber') simNumber?: string,
  ) {
    return this.verificationService.checkBlacklist(ktpNumber, simNumber);
  }
}
