import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignContractDto {
  @ApiProperty({ description: 'URL to the signature image' })
  @IsString()
  @IsNotEmpty()
  signatureUrl: string;
}
