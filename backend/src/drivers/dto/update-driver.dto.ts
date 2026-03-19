import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDriverDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  licenseType?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  licenseExpiry?: string;

  @ApiPropertyOptional({ enum: ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY'] })
  @IsEnum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY'])
  @IsOptional()
  status?: string;
}
