import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMaintenanceDto {
  @ApiPropertyOptional({ enum: ['ROUTINE', 'REPAIR', 'INSPECTION'] })
  @IsEnum(['ROUTINE', 'REPAIR', 'INSPECTION'])
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  nextDueDate?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  odometer?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  vendor?: string;
}
