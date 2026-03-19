import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMaintenanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  carId: string;

  @ApiProperty({ enum: ['ROUTINE', 'REPAIR', 'INSPECTION'] })
  @IsEnum(['ROUTINE', 'REPAIR', 'INSPECTION'])
  type: string;

  @ApiProperty({ example: 'Oil change and filter replacement' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  cost: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '2024-07-15' })
  @IsDateString()
  @IsOptional()
  nextDueDate?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsInt()
  @IsOptional()
  odometer?: number;

  @ApiPropertyOptional({ example: 'Bengkel Jaya Motor' })
  @IsString()
  @IsOptional()
  vendor?: string;
}
