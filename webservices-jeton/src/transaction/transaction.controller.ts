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
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { type Session } from '../types/auth';

@ApiTags('Transactions')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Unauthorized - you need to be signed in',
})
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiResponse({
    status: 200,
    description: 'Get all transactions',
    type: TransactionListResponseDto,
  })
  @Get()
  async getAllTransactions(
    @CurrentUser() user: Session,
  ): Promise<TransactionListResponseDto> {
    return await this.transactionService.getAll(
      user.id,
      user.publicRoles,
      user.privateRoles,
    );
  }

  @ApiResponse({
    status: 200,
    description: 'Get transaction by Id',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Session,
  ) {
    return this.transactionService.getTransactionById(
      id,
      user.id,
      user.publicRoles,
      user.privateRoles,
    );
  }

  @ApiResponse({
    status: 201,
    description: 'Create transaction',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.create(createTransactionDto);
  }

  @ApiResponse({
    status: 200,
    description: 'Update transaction',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  @Put(':id')
  async updateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.updateById(id, updateTransactionDto);
  }

  @ApiResponse({
    status: 204,
    description: 'Delete transaction',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTransaction(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.transactionService.deleteById(id);
  }
}
