import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  carId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  driverId?: string;

  @ApiProperty({ example: '2024-01-15T08:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-01-18T08:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Kantor Cabang Jakarta' })
  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @ApiProperty({ example: 'Bandara Soekarno-Hatta' })
  @IsString()
  @IsNotEmpty()
  dropoffLocation: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  withDriver?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
