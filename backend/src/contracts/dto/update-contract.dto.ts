import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContractDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  terms?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  signatureUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pdfUrl?: string;
}
