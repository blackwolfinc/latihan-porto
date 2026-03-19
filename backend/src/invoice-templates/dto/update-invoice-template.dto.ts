import { IsOptional, IsString, IsArray, ValidateNested, IsHexColor } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class AdditionalBankDto {
  @IsString()
  bankName: string;

  @IsString()
  accountNumber: string;

  @IsString()
  accountName: string;
}

export class UpdateInvoiceTemplateDto {
  // Company Branding
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyTagline?: string;

  // Kop Surat / Letterhead
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headerAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headerCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headerPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headerEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headerWebsite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headerNpwp?: string;

  // Invoice Styling
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  // Signature
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signatureName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signatureTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signatureImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stampImageUrl?: string;

  // Bank Account
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankBranch?: string;

  @ApiPropertyOptional({ type: [AdditionalBankDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalBankDto)
  additionalBanks?: AdditionalBankDto[];

  // Terms & Conditions
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  // Footer
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  footerText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  footerNote?: string;

  // Invoice Number Format
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceNumberFormat?: string;
}
