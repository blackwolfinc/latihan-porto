import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Booking Confirmed' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Your booking #123 has been confirmed.' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ example: 'BOOKING' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ example: { bookingId: 'abc123' } })
  @IsOptional()
  data?: any;
}
