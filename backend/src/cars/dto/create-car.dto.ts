import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsArray, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCarDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'Avanza' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  year: number;

  @ApiProperty({ example: 'B 1234 ABC' })
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @ApiProperty({ example: 'Putih' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ enum: ['SEDAN', 'SUV', 'MPV', 'BUS', 'PICKUP', 'VAN', 'LUXURY'] })
  @IsEnum(['SEDAN', 'SUV', 'MPV', 'BUS', 'PICKUP', 'VAN', 'LUXURY'])
  category: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ example: 350000 })
  @IsNumber()
  dailyRate: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  imageUrls?: string[];

  @ApiProperty({ example: 7 })
  @IsInt()
  seatCount: number;

  @ApiProperty({ enum: ['MANUAL', 'AUTOMATIC'] })
  @IsEnum(['MANUAL', 'AUTOMATIC'])
  transmission: string;

  @ApiProperty({ enum: ['BENSIN', 'DIESEL', 'ELECTRIC', 'HYBRID'] })
  @IsEnum(['BENSIN', 'DIESEL', 'ELECTRIC', 'HYBRID'])
  fuelType: string;

  @ApiPropertyOptional({ example: 15000 })
  @IsInt()
  @IsOptional()
  odometer?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
