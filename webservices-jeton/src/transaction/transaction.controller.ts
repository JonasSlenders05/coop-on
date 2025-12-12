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
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { type Session } from '../types/auth';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrivateRole } from '../auth/roles';

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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - you need to be signed in',
  })
  @Get()
  async getAllTransactions(): Promise<TransactionListResponseDto> {
    return await this.transactionService.getAll();
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
    return this.transactionService.getById(
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
  @Roles(PrivateRole.ADMIN, PrivateRole.USER)
  @HttpCode(HttpStatus.CREATED)
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionRequestDto,
    @CurrentUser() user: Session,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.create(
      createTransactionDto,
      user.id,
      user.publicRoles,
      user.privateRoles,
    );
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
  @Roles(PrivateRole.ADMIN)
  async updateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionRequestDto,
    @CurrentUser() user: Session,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.updateById(
      id,
      updateTransactionDto,
      user.id,
      user.publicRoles,
      user.privateRoles,
    );
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
  @Roles(PrivateRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTransaction(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.transactionService.deleteById(id);
  }

  // @Get('/:id/transactions')
  // async getTransactionsbyWalletId(
  //   @Param('id', ParseIntPipe) id: number,
  // ): Promise<TransactionResponseDto[]> {
  //   return await this.walletService.getTransactionByWalletId(id);
  // }
}
