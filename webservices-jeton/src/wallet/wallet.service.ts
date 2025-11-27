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
  PublicWalletResponseDto,
} from './wallet.dto';
import { eq } from 'drizzle-orm';
import { TransactionResponseDto } from 'src/transaction/transaction.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class WalletService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(): Promise<WalletListResponseDto> {
    const walletList = await this.db.query.wallets.findMany({
      with: {
        user: true,
        event: true,
      },
    });
    const items = walletList.map((wallet) =>
      plainToInstance(PublicWalletResponseDto, wallet, {
        excludeExtraneousValues: true,
      }),
    );
    return { items };
  }

  async getById(id: number): Promise<PublicWalletResponseDto> {
    const wallet = await this.db.query.wallets.findFirst({
      where: eq(wallets.id, id),
      with: {
        user: true,
        event: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with id "${id}" not found`);
    }

    return plainToInstance(PublicWalletResponseDto, wallet, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    wallet: CreateWalletRequestDto,
  ): Promise<PublicWalletResponseDto> {
    const [newWallet] = await this.db
      .insert(wallets)
      .values(wallet)
      .$returningId();

    return this.getById(newWallet.id);
  }

  async updateById(
    id: number,
    changes: UpdateWalletRequestDto,
  ): Promise<PublicWalletResponseDto> {
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
  ): Promise<PublicWalletResponseDto[]> {
    const items = await this.db.query.wallets.findMany({
      where: eq(wallets.userId, customerId),
      with: {
        user: true,
        event: true,
      },
    });

    return items.map((wallet) =>
      plainToInstance(PublicWalletResponseDto, wallet, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async getTransactionByWalletId(
    walletId: number,
  ): Promise<TransactionResponseDto[]> {
    const walletTransactions = await this.db.query.transactions.findMany({
      where: eq(transactions.walletId, walletId),
      with: {
        wallet: true,
        vendor: {
          with: {
            user: true,
          },
        },
      },
    });

    return walletTransactions.map((tx) =>
      plainToInstance(TransactionResponseDto, tx, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
