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
import { and, eq } from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';
import { PrivateRole } from '../auth/roles';

@Injectable()
export class WalletService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(): Promise<WalletListResponseDto> {
    const walletList = await this.db.query.wallets.findMany({
      with: {
        user: {
          columns: {
            email: true,
          },
        },
        event: {
          columns: {
            name: true,
          },
        },
      },
    });

    const items = walletList.map((wallet) =>
      plainToInstance(PublicWalletResponseDto, wallet, {
        excludeExtraneousValues: true,
      }),
    );
    return { items };
  }

  async getById(
    currentUserId: number,
    walletId: number,
    roles: string[],
  ): Promise<PublicWalletResponseDto> {
    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const wallet = await this.db.query.wallets.findFirst({
      where: and(
        eq(wallets.id, walletId),
        isAdmin ? undefined : eq(wallets.userId, currentUserId),
      ),
      with: {
        user: {
          columns: {
            email: true,
          },
        },
        event: {
          columns: {
            name: true,
          },
        },
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
    createWalletDto: CreateWalletRequestDto,
    userId: number,
    roles: string[],
  ): Promise<PublicWalletResponseDto> {
    const [newWallet] = await this.db
      .insert(wallets)
      .values({
        ...createWalletDto,
        userId: userId,
      })
      .$returningId();

    return this.getById(userId, newWallet.id, roles);
  }

  async updateById(
    currentUserId: number,
    walletId: number,
    changes: UpdateWalletRequestDto,
    roles: string[],
  ): Promise<PublicWalletResponseDto> {
    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const [wallet] = await this.db
      .update(wallets)
      .set(changes)
      .where(
        and(
          eq(wallets.id, walletId),
          isAdmin ? undefined : eq(wallets.userId, currentUserId),
        ),
      );

    if (!wallet) {
      throw new NotFoundException('No wallet with this id found');
    }

    return this.getById(currentUserId, walletId, roles);
  }

  async deleteById(
    currentUserId: number,
    walletId: number,
    roles: string[],
  ): Promise<void> {
    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const [result] = await this.db
      .delete(wallets)
      .where(
        isAdmin
          ? eq(wallets.id, walletId)
          : and(eq(wallets.id, walletId), eq(wallets.userId, currentUserId)),
      );

    if (result.affectedRows === 0) {
      throw new NotFoundException('No wallet with this id found');
    }
  }

  //accec gecontrolleerd in eventservice
  async getWalletsByEventId(
    eventId: number,
  ): Promise<PublicWalletResponseDto[]> {
    const walletList = await this.db.query.wallets.findMany({
      where: eq(wallets.eventId, eventId),
      with: {
        user: {
          columns: {
            email: true,
          },
        },
        event: {
          columns: {
            name: true,
          },
        },
      },
    });
    const items = walletList.map((wallet) =>
      plainToInstance(PublicWalletResponseDto, wallet, {
        excludeExtraneousValues: true,
      }),
    );
    return items;
  }

  async getWalletsByUserId(
    currentUserId: number,
    userId: number,
    roles: string[],
  ): Promise<PublicWalletResponseDto[]> {
    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const userWallets = await this.db.query.wallets.findMany({
      where: isAdmin
        ? eq(wallets.userId, userId)
        : and(eq(wallets.userId, userId), eq(wallets.userId, currentUserId)),

      with: {
        user: {
          columns: {
            email: true,
          },
        },
        event: {
          columns: {
            name: true,
          },
        },
      },
    });

    return userWallets.map((wallet) =>
      plainToInstance(PublicWalletResponseDto, wallet, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
