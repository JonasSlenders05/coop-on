import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from 'src/drizzle/drizzle.provider';
import { transactions, wallets } from 'src/drizzle/schema';
import {
  CreateWalletRequestDto,
  UpdateWalletRequestDto,
  WalletListResponseDto,
  WalletResponseDto,
} from './wallet.dto';
import { eq } from 'drizzle-orm';
import { TransactionResponseDto } from 'src/transaction/transaction.dto';

@Injectable()
export class WalletService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(): Promise<WalletListResponseDto> {
    const items = await this.db.query.wallets.findMany({
      with: {
        customer: true,
        event: true,
      },
    });
    return { items };
  }

  async getById(id: number): Promise<WalletResponseDto> {
    const wallet = await this.db.query.wallets.findFirst({
      where: eq(wallets.id, id),
      with: {
        customer: true,
        event: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with id "${id}" not found`);
    }

    return wallet;
  }

  async create(wallet: CreateWalletRequestDto): Promise<WalletResponseDto> {
    const [newWallet] = await this.db
      .insert(wallets)
      .values(wallet)
      .$returningId();

    return this.getById(newWallet.id);
  }

  async updateById(
    id: number,
    changes: UpdateWalletRequestDto,
  ): Promise<WalletResponseDto> {
    const [wallet] = await this.db
      .update(wallets)
      .set(changes)
      .where(eq(wallets.id, id));

    if (!wallet) {
      throw new NotFoundException(`Wallet ${id} not found`);
    }

    return this.getById(id);
  }

  async deleteById(id: number): Promise<void> {
    const [result] = await this.db.delete(wallets).where(eq(wallets.id, id));
    if (result.affectedRows === 0) {
      throw new NotFoundException(`Wallet ${id} not found`);
    }
  }

  async getWalletsBycustomerId(
    customerId: number,
  ): Promise<WalletResponseDto[]> {
    const customerWallets = await this.db.query.wallets.findMany({
      where: eq(wallets.customerId, customerId),
      with: {
        customer: true,
        event: true,
      },
    });
    return customerWallets;
  }

  async getTransactionByWalletId(
    walletId: number,
  ): Promise<TransactionResponseDto[]> {
    const walletTransactions = await this.db.query.transactions.findMany({
      where: eq(transactions.walletId, walletId),
      with: {
        wallet: true,
        vendor: true,
      },
    });
    return walletTransactions;
  }
}
