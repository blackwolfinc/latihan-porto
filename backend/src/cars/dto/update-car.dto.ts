import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsInt, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCarDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  year?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  plateNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ enum: ['SEDAN', 'SUV', 'MPV', 'BUS', 'PICKUP', 'VAN', 'LUXURY'] })
  @IsEnum(['SEDAN', 'SUV', 'MPV', 'BUS', 'PICKUP', 'VAN', 'LUXURY'])
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE'] })
  @IsEnum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  dailyRate?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  imageUrls?: string[];

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  seatCount?: number;

  @ApiPropertyOptional({ enum: ['MANUAL', 'AUTOMATIC'] })
  @IsEnum(['MANUAL', 'AUTOMATIC'])
  @IsOptional()
  transmission?: string;

  @ApiPropertyOptional({ enum: ['BENSIN', 'DIESEL', 'ELECTRIC', 'HYBRID'] })
  @IsEnum(['BENSIN', 'DIESEL', 'ELECTRIC', 'HYBRID'])
  @IsOptional()
  fuelType?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  odometer?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
