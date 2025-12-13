import {
  forwardRef,
  Inject,
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
import { transactions } from '../drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';
import { WalletService } from '../wallet/wallet.service';
import { EventService } from '../event/event.service';
import { PrivateRole } from '../auth/roles';
import { VendorService } from '../vendor/vendor.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectDrizzle() private readonly db: DatabaseProvider,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
    @Inject(forwardRef(() => VendorService))
    private readonly vendorService: VendorService,
  ) {}

  async getAll(): Promise<TransactionListResponseDto> {
    const items = await this.db.query.transactions.findMany({
      with: {
        wallet: true,
        vendor: {
          columns: {
            boothName: true,
            userId: true,
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
    transactionId: number,
    userId: number,
    roles: string[],
  ): Promise<TransactionResponseDto> {
    await this.walletService.getWalletsByUserId(userId, userId, roles); //controleert of de transactions uit 1 van de user zijn wallets komt

    const transaction = await this.db.query.transactions.findFirst({
      where: eq(transactions.id, transactionId),
      with: {
        wallet: true,
        vendor: {
          columns: {
            boothName: true,
            userId: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('No transaction with this id exists');
    }

    return plainToInstance(TransactionResponseDto, transaction, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    dto: CreateTransactionRequestDto,
    currentUserId: number,
    roles: string[],
  ): Promise<TransactionResponseDto> {
    const wallet = await this.walletService.getById(
      currentUserId,
      dto.walletId,
      roles,
    );

    await this.vendorService.getById(dto.vendorId); //controleert of vendor id klopt

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

    return this.getById(newTransaction.id, currentUserId, roles);
  }

  async updateById(
    id: number,
    changes: UpdateTransactionRequestDto,
    userId: number,
    roles: string[],
  ): Promise<TransactionResponseDto> {
    const [result] = await this.db
      .update(transactions)
      .set(changes)
      .where(eq(transactions.id, id));

    if (!result) {
      throw new NotFoundException('No transaction with this id exists');
    }

    return this.getById(id, userId, roles);
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
          columns: {
            boothName: true,
            userId: true,
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
    currentUserId: number,
    vendorId: number,
    roles: string[],
  ): Promise<TransactionResponseDto[]> {
    await this.vendorService.verifyAcces(currentUserId, vendorId, roles);

    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const walletTransactions = await this.db.query.transactions.findMany({
      where: and(
        isAdmin ? undefined : eq(transactions.vendorId, currentUserId),
        eq(transactions.vendorId, vendorId),
      ),
      with: {
        wallet: true,
        vendor: {
          columns: {
            boothName: true,
            userId: true,
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
          columns: {
            boothName: true,
            userId: true,
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
