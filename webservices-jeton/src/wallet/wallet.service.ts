import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';
import { wallets } from '../drizzle/schema';
import {
  CreateWalletRequestDto,
  UpdateWalletRequestDto,
  WalletListResponseDto,
  PublicWalletResponseDto,
} from './wallet.dto';
import { eq } from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class WalletService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(
    userId: number,
    roles: string[],
  ): Promise<WalletListResponseDto> {
    const isAdmin = roles.includes('admin');

    const walletList = await this.db.query.wallets.findMany({
      where: isAdmin ? undefined : eq(wallets.userId, userId),
    });

    const items = walletList.map((wallet) =>
      plainToInstance(PublicWalletResponseDto, wallet, {
        excludeExtraneousValues: true,
      }),
    );
    return { items };
  }

  async getById(id: number, roles: string[]): Promise<PublicWalletResponseDto> {
    const isAdmin = roles.includes('admin');

    const wallet = await this.db.query.wallets.findFirst({
      where: isAdmin ? undefined : eq(wallets.id, id),
      with: {
        user: true,
        event: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException('No wallet with this id found');
    }

    return plainToInstance(PublicWalletResponseDto, wallet, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    wallet: CreateWalletRequestDto,
    userId: number,
    roles: string[],
  ): Promise<PublicWalletResponseDto> {
    const [newWallet] = await this.db
      .insert(wallets)
      .values({
        ...wallet,
        userId: userId,
      })
      .$returningId();

    return this.getById(newWallet.id, roles);
  }

  async updateById(
    id: number,
    changes: UpdateWalletRequestDto,
    roles: string[],
  ): Promise<PublicWalletResponseDto> {
    const [wallet] = await this.db
      .update(wallets)
      .set(changes)
      .where(eq(wallets.id, id));

    if (!wallet) {
      throw new NotFoundException('No wallet with this id found');
    }

    return this.getById(id, roles);
  }

  async deleteById(id: number): Promise<void> {
    const [result] = await this.db.delete(wallets).where(eq(wallets.id, id));
    if (result.affectedRows === 0) {
      throw new NotFoundException('No wallet with this id found');
    }
  }

  // async getWalletBycustomerId(
  //   customerId: number,
  // ): Promise<PublicWalletResponseDto> {
  //   const wallet = await this.db.query.wallets.findFirst({
  //     where: eq(wallets.userId, customerId),
  //     with: {
  //       user: true,
  //       event: true,
  //     },
  //   });

  //   if (!wallet) {
  //     throw new NotFoundException('No wallet with this id found');
  //   }

  //   return plainToInstance(PublicWalletResponseDto, wallet, {
  //     excludeExtraneousValues: true,
  //   });
  // }

  // async getTransactionByWalletId(
  //   walletId: number,
  // ): Promise<TransactionResponseDto[]> {
  //   const walletTransactions = await this.db.query.transactions.findMany({
  //     where: eq(transactions.walletId, walletId),
  //     with: {
  //       wallet: true,
  //       vendor: {
  //         with: {
  //           user: true,
  //         },
  //       },
  //     },
  //   });

  //   return walletTransactions.map((tx) =>
  //     plainToInstance(TransactionResponseDto, tx, {
  //       excludeExtraneousValues: true,
  //     }),
  //   );
  // }
}
