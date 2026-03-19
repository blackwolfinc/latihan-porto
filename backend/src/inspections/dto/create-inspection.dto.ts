import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInspectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  carId: string;

  @ApiProperty({ enum: ['PRE_RENTAL', 'POST_RENTAL'] })
  @IsEnum(['PRE_RENTAL', 'POST_RENTAL'])
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  inspectorId: string;

  @ApiProperty({ example: 'Good condition, minor scratches on left door' })
  @IsString()
  @IsNotEmpty()
  exteriorStatus: string;

  @ApiProperty({ example: 'Clean, all seats intact' })
  @IsString()
  @IsNotEmpty()
  interiorStatus: string;

  @ApiPropertyOptional({ example: 'Engine running smoothly' })
  @IsString()
  @IsOptional()
  engineStatus?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [String], example: ['https://storage/photo1.jpg'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  damagePhotos?: string[];
}
