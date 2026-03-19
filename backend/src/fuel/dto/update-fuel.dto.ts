import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFuelDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  liters?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  odometer?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ enum: ['BENSIN', 'DIESEL', 'ELECTRIC', 'HYBRID'] })
  @IsEnum(['BENSIN', 'DIESEL', 'ELECTRIC', 'HYBRID'])
  @IsOptional()
  fuelType?: string;
}
