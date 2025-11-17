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
  CreateWalletRequestDto,
  UpdateWalletRequestDto,
  WalletListResponseDto,
  PublicWalletResponseDto,
} from './wallet.dto';
import { WalletService } from './wallet.service';
import { TransactionResponseDto } from 'src/transaction/transaction.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getAllWallets(): Promise<WalletListResponseDto> {
    return this.walletService.getAll();
  }

  @Get(':id')
  async getWalletById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PublicWalletResponseDto> {
    return this.walletService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWallet(
    @Body() createWalletDto: CreateWalletRequestDto,
  ): Promise<PublicWalletResponseDto> {
    return this.walletService.create(createWalletDto);
  }

  @Put(':id')
  async updateWallet(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWalletDto: UpdateWalletRequestDto,
  ): Promise<PublicWalletResponseDto> {
    return this.walletService.updateById(id, updateWalletDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWallet(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.walletService.deleteById(id);
  }

  @Get('/:id/transactions')
  async getTransactionsbyWalletId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TransactionResponseDto[]> {
    return await this.walletService.getTransactionByWalletId(id);
  }
}
