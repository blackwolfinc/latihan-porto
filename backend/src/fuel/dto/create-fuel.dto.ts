import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFuelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  carId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  driverId?: string;

  @ApiProperty({ example: 45.5 })
  @IsNumber()
  liters: number;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  cost: number;

  @ApiProperty({ example: 51000 })
  @IsInt()
  odometer: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: ['BENSIN', 'DIESEL', 'ELECTRIC', 'HYBRID'] })
  @IsEnum(['BENSIN', 'DIESEL', 'ELECTRIC', 'HYBRID'])
  fuelType: string;
}
