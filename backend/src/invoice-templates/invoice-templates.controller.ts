import { Controller, Get, Put, Patch, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoiceTemplatesService } from './invoice-templates.service';
import { UpdateInvoiceTemplateDto } from './dto/update-invoice-template.dto';

@ApiTags('invoice-templates')
@ApiBearerAuth()
@Controller('invoice-templates')
export class InvoiceTemplatesController {
  constructor(private readonly service: InvoiceTemplatesService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current organization invoice template' })
  async getCurrent(@Req() req: any) {
    const organizationId = req.user?.organizationId;
    return this.service.getByOrganization(organizationId);
  }

  @Put('current')
  @ApiOperation({ summary: 'Create or update current organization invoice template' })
  async createOrUpdate(@Req() req: any, @Body() dto: UpdateInvoiceTemplateDto) {
    const organizationId = req.user?.organizationId;
    return this.service.createOrUpdate(organizationId, dto);
  }

  @Patch('current/logo')
  @ApiOperation({ summary: 'Update logo URL' })
  async updateLogo(@Req() req: any, @Body() body: { logoUrl: string }) {
    const organizationId = req.user?.organizationId;
    return this.service.updateLogo(organizationId, body.logoUrl);
  }

  @Patch('current/signature')
  @ApiOperation({ summary: 'Update signature and stamp' })
  async updateSignature(@Req() req: any, @Body() body: {
    signatureName?: string;
    signatureTitle?: string;
    signatureImageUrl?: string;
    stampImageUrl?: string;
  }) {
    const organizationId = req.user?.organizationId;
    return this.service.updateSignature(organizationId, body);
  }

  @Patch('current/bank')
  @ApiOperation({ summary: 'Update bank account information' })
  async updateBank(@Req() req: any, @Body() body: {
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    bankBranch?: string;
    additionalBanks?: any[];
  }) {
    const organizationId = req.user?.organizationId;
    return this.service.updateBankInfo(organizationId, body);
  }

  @Get('preview')
  @ApiOperation({ summary: 'Get preview data with template applied' })
  async preview(@Req() req: any) {
    const organizationId = req.user?.organizationId;
    return this.service.getPreviewData(organizationId);
  }
}
