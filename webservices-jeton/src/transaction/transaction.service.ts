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
  organisers,
  transactions,
  users,
  vendors,
  wallets,
} from '../drizzle/schema';
import { and, eq, or, SQL } from 'drizzle-orm';
import { PrivateRole, PublicRole } from '../auth/roles';
import { plainToInstance } from 'class-transformer';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectDrizzle() private readonly db: DatabaseProvider,
    private readonly walletService: WalletService,
  ) {}

  async getAll(
    userId: number,
    publicRole: string[] = [],
    privateRole: string[] = [],
  ): Promise<TransactionListResponseDto> {
    const isAdmin = privateRole.includes(PrivateRole.ADMIN);
    const isVendor = publicRole.includes(PublicRole.VENDOR);
    const isCustomer = publicRole.includes(PublicRole.CUSTOMER);
    const isOrganiser = publicRole.includes(PublicRole.ORGANISER);

    const conditions: SQL<unknown>[] = [];

    if (isAdmin) {
      // geen filter
    } else if (isVendor) {
      conditions.push(eq(transactions.vendorId, userId));
    } else if (isCustomer) {
      conditions.push(eq(wallets.userId, userId));
    } else if (isOrganiser) {
      conditions.push(eq(organisers.userId, userId));
    } else {
      throw new ForbiddenException('No valid role for viewing transactions');
    }

    const result = await this.db
      .select({
        id: transactions.id,
        date: transactions.date,
        amount: transactions.amount,
        walletId: transactions.walletId,
        vendorId: transactions.vendorId,
        eventId: transactions.eventId,
      })
      .from(transactions)
      .leftJoin(wallets, eq(transactions.walletId, wallets.id))
      .leftJoin(events, eq(wallets.eventId, events.id))
      .leftJoin(organisers, eq(events.organiserId, organisers.userId))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return { items: result };
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
    const wallet = await this.walletService.getById(dto.walletId, roles);
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
}
