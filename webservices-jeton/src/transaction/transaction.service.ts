import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from 'src/drizzle/drizzle.provider';
import {
  CreateTransactionRequestDto,
  TransactionListResponseDto,
  TransactionResponseDto,
  UpdateTransactionRequestDto,
} from './transaction.dto';
import { events, transactions, wallets } from 'src/drizzle/schema';
import { and, desc, eq, exists, inArray, or, SQL, sql } from 'drizzle-orm';
import { UserService } from 'src/user/user.service';
import { PrivateRole, PublicRole } from 'src/auth/roles';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TransactionService {
  constructor(
    @InjectDrizzle() private readonly db: DatabaseProvider,
    private readonly userService: UserService,
  ) {}

  async getAll(
    userId: number,
    publicRole: string[],
    privateRole: string[],
  ): Promise<TransactionListResponseDto> {
    const isAdmin = privateRole.includes(PrivateRole.ADMIN);
    const isVendor = publicRole.includes(PublicRole.VENDOR);
    const isCustomer = publicRole.includes(PublicRole.CUSTOMER);
    const isOrganiser = publicRole.includes(PublicRole.ORGANISER);

    if (isAdmin) {
      return {
        items: await this.db.query.transactions.findMany({
          columns: {
            id: true,
            amount: true,
            date: true,
            walletId: true,
            vendorId: true,
          },
          with: {
            wallet: {
              columns: { id: true, value: true },
              with: {
                user: {
                  columns: { id: true, firstname: true, lastname: true },
                },
                event: {
                  columns: { id: true, name: true },
                },
              },
            },
            vendor: {
              columns: { boothName: true },
              with: {
                user: {
                  columns: { id: true, firstname: true, lastname: true },
                },
              },
            },
          },
          orderBy: desc(transactions.date),
        }),
      };
    }

    if (isOrganiser) {
      const organisedEvents = await this.db.query.events.findMany({
        where: eq(events.organiserId, userId),
        columns: { id: true },
      });

      if (organisedEvents.length === 0) return { items: [] };

      const eventIds = organisedEvents.map((e) => e.id);

      const walletIds = await this.db
        .select({ id: wallets.id })
        .from(wallets)
        .where(inArray(wallets.eventId, eventIds))
        .then((rows) => rows.map((r) => r.id));

      if (walletIds.length === 0) return { items: [] };

      return {
        items: await this.db.query.transactions.findMany({
          columns: {
            id: true,
            amount: true,
            date: true,
            walletId: true,
            vendorId: true,
          },
          where: inArray(transactions.walletId, walletIds),
          with: {
            wallet: {
              columns: { id: true, value: true },
              with: {
                user: {
                  columns: { id: true, firstname: true, lastname: true },
                },
                event: {
                  columns: { id: true, name: true },
                },
              },
            },
            vendor: {
              columns: { boothName: true },
              with: {
                user: {
                  columns: { id: true, firstname: true, lastname: true },
                },
              },
            },
          },
          orderBy: desc(transactions.date),
        }),
      };
    }

    if (isVendor && isCustomer) {
      const userWallets = await this.userService.getWalletsByUserId(userId);
      const walletIds = userWallets.map((w) => w.id);

      const whereClause =
        walletIds.length > 0
          ? or(
              eq(transactions.vendorId, userId),
              inArray(transactions.walletId, walletIds),
            )
          : eq(transactions.vendorId, userId);

      return {
        items: await this.db.query.transactions.findMany({
          columns: {
            id: true,
            amount: true,
            date: true,
            walletId: true,
            vendorId: true,
          },
          where: whereClause,
          with: {
            wallet: {
              columns: { id: true, value: true },
              with: {
                user: {
                  columns: { id: true, firstname: true, lastname: true },
                },
                event: { columns: { id: true, name: true } },
              },
            },
            vendor: {
              columns: { boothName: true },
              with: {
                user: {
                  columns: { id: true, firstname: true, lastname: true },
                },
              },
            },
          },
          orderBy: desc(transactions.date),
        }),
      };
    }

    if (isVendor) {
      return {
        items: await this.db.query.transactions.findMany({
          columns: {
            id: true,
            amount: true,
            date: true,
            walletId: true,
            vendorId: true,
          },
          where: eq(transactions.vendorId, userId),
          with: {
            wallet: {
              columns: { id: true, value: true },
              with: {
                user: {
                  columns: { id: true, firstname: true, lastname: true },
                },
                event: { columns: { id: true, name: true } },
              },
            },
            vendor: {
              columns: { boothName: true },
              with: {
                user: {
                  columns: { id: true, firstname: true, lastname: true },
                },
              },
            },
          },
          orderBy: desc(transactions.date),
        }),
      };
    }

    {
      const userWallets = await this.userService.getWalletsByUserId(userId);
      const walletIds = userWallets.map((w) => w.id);

      if (walletIds.length === 0) return { items: [] };

      return {
        items: await this.db.query.transactions.findMany({
          columns: {
            id: true,
            amount: true,
            date: true,
            walletId: true,
            vendorId: true,
          },
          where: inArray(transactions.walletId, walletIds),
          with: {
            wallet: {
              columns: { id: true, value: true },
              with: {
                user: {
                  columns: { id: true, firstname: true, lastname: true },
                },
                event: { columns: { id: true, name: true } },
              },
            },
            vendor: {
              columns: { boothName: true },
              with: {
                user: {
                  columns: { id: true, firstname: true, lastname: true },
                },
              },
            },
          },
          orderBy: desc(transactions.date),
        }),
      };
    }

    return { items: [] };
  }

  async getTransactionById(
    id: number,
    userId: number,
    publicRoles: string[],
    privateRoles: string[],
  ): Promise<TransactionResponseDto> {
    const isAdmin = privateRoles.includes(PrivateRole.ADMIN);
    const isVendor = publicRoles.includes(PublicRole.VENDOR);
    const isCustomer = publicRoles.includes(PublicRole.CUSTOMER);
    const isOrganiser = publicRoles.includes(PublicRole.ORGANISER);

    let authorizationCondition: SQL<unknown> | undefined;

    if (!isAdmin) {
      const conditions: SQL<unknown>[] = [];

      if (isCustomer) {
        conditions.push(
          exists(
            this.db
              .select({ one: sql`1` })
              .from(wallets)
              .where(
                and(
                  eq(wallets.id, transactions.walletId),
                  eq(wallets.userId, userId),
                ),
              ),
          ),
        );
      }

      if (isVendor) {
        conditions.push(eq(transactions.vendorId, userId));
      }

      if (isOrganiser) {
        conditions.push(
          exists(
            this.db
              .select({ one: sql`1` })
              .from(wallets)
              .innerJoin(events, eq(wallets.eventId, events.id))
              .where(
                and(
                  eq(wallets.id, transactions.walletId),
                  eq(events.organiserId, userId),
                ),
              ),
          ),
        );
      }

      if (conditions.length === 0) {
        throw new ForbiddenException(
          'You do not have permission to view transactions',
        );
      }

      authorizationCondition = or(...conditions);
    }

    const transaction = await this.db.query.transactions.findFirst({
      where: and(eq(transactions.id, id), authorizationCondition),
      columns: {
        id: true,
        amount: true,
        date: true,
        walletId: true,
        vendorId: true,
      },
      with: {
        wallet: {
          columns: { id: true, value: true },
          with: {
            user: { columns: { id: true, firstname: true, lastname: true } },
            event: { columns: { id: true, name: true } },
          },
        },
        vendor: {
          columns: { boothName: true },
          with: {
            user: { columns: { id: true, firstname: true, lastname: true } },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found or access denied');
    }

    return plainToInstance(TransactionResponseDto, transaction, {
      excludeExtraneousValues: true,
    });
  }

  private async getById(id: number): Promise<TransactionResponseDto> {
    const transaction = await this.db.query.transactions.findFirst({
      where: eq(transactions.id, id),
    });

    if (!transaction) {
      throw new NotFoundException('No transaction with this id exists');
    }

    return plainToInstance(TransactionResponseDto, transaction, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    transaction: CreateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    const [newTransaction] = await this.db
      .insert(transactions)
      .values(transaction)
      .$returningId();

    return this.getById(newTransaction.id);
  }

  async updateById(
    id: number,
    changes: UpdateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    const [result] = await this.db
      .update(transactions)
      .set(changes)
      .where(eq(transactions.id, id));

    if (!result) {
      throw new NotFoundException('No transaction with this id exists');
    }

    return this.getById(id);
  }

  async deleteById(id: number): Promise<void> {
    const [result] = await this.db
      .delete(transactions)
      .where(eq(transactions.id, id));
    if (result.affectedRows === 0) {
      throw new NotFoundException('No transaction with this id exists');
    }
  }
}
