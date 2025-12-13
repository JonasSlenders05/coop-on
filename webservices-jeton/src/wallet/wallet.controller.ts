import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
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
import { PrivateRole } from '../auth/roles';
import { Roles } from '../auth/decorators/roles.decorator';
import { type Session } from '../types/auth';

import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { TransactionService } from '../transaction/transaction.service';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Wallets')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Unauthorized - you need to be signed in',
})
@Controller('wallets')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
  ) {}

  @Get()
  @Roles(PrivateRole.ADMIN)
  async getAllWallets(): Promise<WalletListResponseDto> {
    return this.walletService.getAll();
  }

  @Get(':id')
  @Roles(PrivateRole.ADMIN, PrivateRole.USER)
  async getWalletById(
    @Param('id', ParseIntPipe) walletId: number,
    @CurrentUser() user: Session,
  ): Promise<PublicWalletResponseDto> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.walletService.getById(user.id, walletId, roles);
  }

  @Post()
  @Roles(PrivateRole.ADMIN, PrivateRole.USER)
  @HttpCode(HttpStatus.CREATED)
  async createWallet(
    @Body() createWalletDto: CreateWalletRequestDto,
    @CurrentUser() user: Session,
  ): Promise<PublicWalletResponseDto> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.walletService.create(createWalletDto, user.id, roles);
  }

  @Put(':id')
  @Roles(PrivateRole.ADMIN, PrivateRole.USER)
  async updateWallet(
    @Param('id', ParseIntPipe) walletId: number,
    @Body() updateWalletDto: UpdateWalletRequestDto,
    @CurrentUser() user: Session,
  ): Promise<PublicWalletResponseDto> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.walletService.updateById(
      user.id,
      walletId,
      updateWalletDto,
      roles,
    );
  }

  @Delete(':id')
  @Roles(PrivateRole.ADMIN, PrivateRole.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWallet(
    @Param('id', ParseIntPipe) walletId: number,
    @CurrentUser() user: Session,
  ): Promise<void> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.walletService.deleteById(user.id, walletId, roles);
  }

  @Get(':id/transactions')
  @Roles(PrivateRole.ADMIN, PrivateRole.USER)
  async getTransactionsByWalletId(
    @Param('id', ParseIntPipe) walletId: number,
    @CurrentUser() user: Session,
  ) {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.transactionService.getTransactionsByWalletId(
      user.id,
      walletId,
      roles,
    );
  }
}
