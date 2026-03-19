import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContractDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiPropertyOptional({ description: 'Custom terms, auto-generated if not provided' })
  @IsString()
  @IsOptional()
  terms?: string;
}
