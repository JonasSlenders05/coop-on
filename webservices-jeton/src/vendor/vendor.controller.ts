import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  CreateVendorRequestDto,
  UpdateVendorRequestDto,
  VendorListResponseDto,
  VendorResponseDto,
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
  ): Promise<VendorResponseDto> {
    return this.vendorService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVendor(
    @Body() createVendorDto: CreateVendorRequestDto,
  ): Promise<VendorResponseDto> {
    return this.vendorService.create(createVendorDto);
  }

  @Put()
  async updateVendor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVendorDto: UpdateVendorRequestDto,
  ): Promise<VendorResponseDto> {
    return this.vendorService.updateById(id, updateVendorDto);
  }

  @Delete('id')
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
