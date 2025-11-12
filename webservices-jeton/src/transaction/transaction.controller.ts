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
import { TransactionService } from './transaction.service';
import {
  CreateTransactionRequestDto,
  TransactionListResponseDto,
  TransactionResponseDto,
  UpdateTransactionRequestDto,
} from './transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getAllTransactions(): Promise<TransactionListResponseDto> {
    return this.transactionService.getAll();
  }

  @Get(':id')
  async getTransactionsById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.create(createTransactionDto);
  }

  @Put(':id')
  async updateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.updateById(id, updateTransactionDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTransaction(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.transactionService.deleteById(id);
  }
}
