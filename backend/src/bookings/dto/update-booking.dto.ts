import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookingDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pickupLocation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dropoffLocation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  driverId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  withDriver?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'] })
  @IsEnum(['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: string;
}
