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
import { PrivateRole, PublicRole } from '../auth/roles';
import { Roles } from '../auth/decorators/roles.decorator';
import { type Session } from '../types/auth';

import { CurrentUser } from '../auth/decorators/currentUser.decorator';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @Roles(PrivateRole.ADMIN, PublicRole.CUSTOMER)
  async getAllWallets(
    @CurrentUser() user: Session,
  ): Promise<WalletListResponseDto> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.walletService.getAll(user.id, roles);
  }

  @Get(':id')
  @Roles(PrivateRole.ADMIN, PublicRole.CUSTOMER)
  async getWalletById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Session,
  ): Promise<PublicWalletResponseDto> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.walletService.getById(id, roles);
  }

  @Post()
  @Roles(PrivateRole.ADMIN, PublicRole.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  async createWallet(
    @Body() createWalletDto: CreateWalletRequestDto,
    @CurrentUser() user: Session,
  ): Promise<PublicWalletResponseDto> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.walletService.create(createWalletDto, user.id, roles);
  }

  @Put(':id')
  @Roles(PrivateRole.ADMIN, PublicRole.CUSTOMER)
  async updateWallet(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWalletDto: UpdateWalletRequestDto,
    @CurrentUser() user: Session,
  ): Promise<PublicWalletResponseDto> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.walletService.updateById(id, updateWalletDto, roles);
  }

  @Delete(':id')
  @Roles(PrivateRole.ADMIN, PublicRole.CUSTOMER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWallet(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.walletService.deleteById(id);
  }

  // @Get('/:id/transactions')
  // async getTransactionsbyWalletId(
  //   @Param('id', ParseIntPipe) id: number,
  // ): Promise<TransactionResponseDto[]> {
  //   return await this.walletService.getTransactionByWalletId(id);
  // }
}
