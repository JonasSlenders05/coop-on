import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';
import {
  CreateTransactionRequestDto,
  TransactionListResponseDto,
  TransactionResponseDto,
  UpdateTransactionRequestDto,
} from './transaction.dto';
import {
  events,
  transactions,
  users,
  vendors,
  wallets,
} from '../drizzle/schema';
import { and, eq, or, SQL } from 'drizzle-orm';
import { PrivateRole, PublicRole } from '../auth/roles';
import { plainToInstance } from 'class-transformer';
import { WalletService } from '../wallet/wallet.service';
import { EventService } from '../event/event.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectDrizzle() private readonly db: DatabaseProvider,
    private readonly walletService: WalletService,
    private readonly eventService: EventService,
  ) {}

  async getAll(): Promise<TransactionListResponseDto> {
    const items = await this.db.query.transactions.findMany({
      with: {
        wallet: true,
        vendor: {
          with: {
            user: true,
          },
        },
      },
    });

    return {
      items: items.map((item) =>
        plainToInstance(TransactionResponseDto, item, {
          excludeExtraneousValues: true,
        }),
      ),
    };
  }

  async getById(
    id: number,
    userId: number,
    publicRoles: string[] = [],
    privateRoles: string[] = [],
  ): Promise<TransactionResponseDto> {
    const isAdmin = privateRoles.includes(PrivateRole.ADMIN);
    const isVendor = publicRoles.includes(PublicRole.VENDOR);
    const isCustomer = publicRoles.includes(PublicRole.CUSTOMER);
    const isOrganiser = publicRoles.includes(PublicRole.ORGANISER);

    const conditions: SQL<unknown>[] = [eq(transactions.id, id)];

    if (!isAdmin) {
      const authConditions: SQL<unknown>[] = [];

      if (isVendor) {
        authConditions.push(eq(transactions.vendorId, userId));
      }

      if (isCustomer) {
        authConditions.push(eq(wallets.userId, userId));
      }

      if (isOrganiser) {
        authConditions.push(eq(events.organiserId, userId));
      }

      if (authConditions.length === 0) {
        throw new ForbiddenException(
          'You do not have permission to view transactions',
        );
      }

      const authCondition = or(...authConditions);
      if (authCondition) {
        conditions.push(authCondition);
      }
    }

    const transaction = await this.db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        date: transactions.date,
        walletId: transactions.walletId,
        vendorId: transactions.vendorId,
        wallet: transactions.walletId,
        vendor: transactions.vendorId,
        eventId: transactions.eventId,
      })
      .from(transactions)
      .leftJoin(wallets, eq(transactions.walletId, wallets.id))
      .leftJoin(events, eq(wallets.eventId, events.id))
      .leftJoin(vendors, eq(transactions.vendorId, vendors.userId))
      .leftJoin(users, eq(wallets.userId, users.id))
      .where(and(...conditions))
      .limit(1);

    if (!transaction || transaction.length === 0) {
      throw new NotFoundException('Transaction not found or access denied');
    }

    return plainToInstance(TransactionResponseDto, transaction[0], {
      excludeExtraneousValues: true,
    });
  }

  async create(
    dto: CreateTransactionRequestDto,
    userId: number,
    publicRoles: string[],
    privateRoles: string[],
  ): Promise<TransactionResponseDto> {
    const roles = [...publicRoles, ...privateRoles];
    const wallet = await this.walletService.getById(
      userId,
      dto.walletId,
      roles,
    );
    const [newTransaction] = await this.db
      .insert(transactions)
      .values({
        amount: dto.amount,
        walletId: wallet.id,
        vendorId: dto.vendorId,
        eventId: wallet.eventId,
        date: new Date(),
      })
      .$returningId();

    return this.getById(newTransaction.id, userId, publicRoles, privateRoles);
  }

  async updateById(
    id: number,
    changes: UpdateTransactionRequestDto,
    userId: number,
    publicRoles: string[],
    privateRoles: string[],
  ): Promise<TransactionResponseDto> {
    const [result] = await this.db
      .update(transactions)
      .set(changes)
      .where(eq(transactions.id, id));

    if (!result) {
      throw new NotFoundException('No transaction with this id exists');
    }

    return this.getById(id, userId, publicRoles, privateRoles);
  }

  async deleteById(id: number): Promise<void> {
    const [result] = await this.db
      .delete(transactions)
      .where(eq(transactions.id, id));
    if (result.affectedRows === 0) {
      throw new NotFoundException('No transaction with this id exists');
    }
  }

  async getTransactionsByWalletId(
    currentUserId: number,
    walletId: number,
    roles: string[],
  ): Promise<TransactionResponseDto[]> {
    await this.walletService.getById(currentUserId, walletId, roles);

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

    return walletTransactions.map((transaction) =>
      plainToInstance(TransactionResponseDto, transaction, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async getTransactionsByVendorId(
    vendorId: number,
  ): Promise<TransactionResponseDto[]> {
    const walletTransactions = await this.db.query.transactions.findMany({
      where: eq(transactions.vendorId, vendorId),
      with: {
        wallet: true,
        vendor: {
          with: {
            user: true,
          },
        },
      },
    });

    return walletTransactions.map((transaction) =>
      plainToInstance(TransactionResponseDto, transaction, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async getTransactionsByEventId(
    currentUserId: number,
    eventId: number,
    roles: string[],
  ): Promise<TransactionResponseDto[]> {
    await this.eventService.verifyAcces(eventId, currentUserId, roles);

    const eventTransactions = await this.db.query.transactions.findMany({
      where: eq(transactions.eventId, eventId),
      with: {
        wallet: true,
        vendor: {
          with: {
            user: true,
          },
        },
      },
    });
    return eventTransactions.map((transaction) =>
      plainToInstance(TransactionResponseDto, transaction, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
