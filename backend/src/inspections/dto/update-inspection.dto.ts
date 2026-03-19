import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInspectionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  exteriorStatus?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  interiorStatus?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  engineStatus?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  damagePhotos?: string[];
}
