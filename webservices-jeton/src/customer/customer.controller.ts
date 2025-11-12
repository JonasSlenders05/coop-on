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
import { WalletService } from 'src/wallet/wallet.service';
import {
  CreateCustomerResquestDto,
  CustomerListResponseDto,
  CustomerResponseDto,
  UpdateCustomerRequestDto,
} from './customer.dto';
import { CustomerService } from './customer.service';
import { WalletResponseDto } from 'src/wallet/wallet.dto';

@Controller('customers')
export class CustomerController {
  constructor(
    private customerService: CustomerService,
    private walletService: WalletService,
  ) {}

  @Get()
  async getAllCustomers(): Promise<CustomerListResponseDto> {
    return this.customerService.getAll();
  }

  @Get(':id')
  async getCustomersById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CustomerResponseDto> {
    return this.customerService.getById(id);
  }

  @Post()
  async createCustomer(
    @Body() customer: CreateCustomerResquestDto,
  ): Promise<CustomerResponseDto> {
    return this.customerService.create(customer);
  }

  @Put(':id')
  async updateCustomerById(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateCustomerRequestDto,
  ): Promise<CustomerResponseDto> {
    return this.customerService.updateById(id, changes);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCustomerById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.customerService.deleteById(id);
  }

  @Get(':id/wallets')
  async getWalletsBycustomerId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WalletResponseDto[]> {
    return this.walletService.getWalletsBycustomerId(id);
  }
}
