import { IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDriverDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'SIM-1234567890' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  licenseType: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  licenseExpiry: string;
}
