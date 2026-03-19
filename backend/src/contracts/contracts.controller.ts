import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { SignContractDto } from './dto/sign-contract.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('generate')
  @Roles('ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Generate contract from booking' })
  generate(@Body() dto: CreateContractDto) {
    return this.contractsService.generate(dto);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get contract by booking ID' })
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.contractsService.findByBooking(bookingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id/sign')
  @ApiOperation({ summary: 'Sign a contract' })
  sign(@Param('id') id: string, @Body() dto: SignContractDto) {
    return this.contractsService.sign(id, dto.signatureUrl);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete contract' })
  remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }
}
