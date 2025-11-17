import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import {
  PublicVendorResponseDto,
  UpdateVendorRequestDto,
  VendorListResponseDto,
} from './vendor.dto';
import { VendorService } from './vendor.service';
import { TransactionResponseDto } from 'src/transaction/transaction.dto';

@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  async getAllVendors(): Promise<VendorListResponseDto> {
    return this.vendorService.getAll();
  }

  @Get(':id')
  async getVendorById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PublicVendorResponseDto> {
    return this.vendorService.getById(id);
  }

  @Put(':id')
  async updateVendor(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateVendorDto: UpdateVendorRequestDto,
  ): Promise<PublicVendorResponseDto> {
    return this.vendorService.updateById(userId, updateVendorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVendor(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.vendorService.deleteById(id);
  }

  @Get('/:id/transactions')
  async getTransactionsbyWalletId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TransactionResponseDto[]> {
    return await this.vendorService.getTransactionByVendorId(id);
  }
}
