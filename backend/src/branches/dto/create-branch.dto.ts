import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'Cabang Jakarta Pusat' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Jl. Sudirman No. 1' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Jakarta' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ example: '021-1234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: -6.2088 })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ example: 106.8456 })
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  organizationId?: string;
}
