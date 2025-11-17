import { Injectable, NotFoundException } from '@nestjs/common';
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
import { transactions } from 'src/drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class TransactionService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(): Promise<TransactionListResponseDto> {
    const items = await this.db.query.transactions.findMany({
      // with: {
      //   wallet: true,
      //   vendor: true,
      // },
    });

    return { items };
  }

  async getById(id: number): Promise<TransactionResponseDto> {
    const transaction = await this.db.query.transactions.findFirst({
      where: eq(transactions.id, id),
      // with: {
      //   wallet: true,
      //   vendor: true,
      // },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with id "${id}" not found`);
    }

    return transaction;
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
      throw new NotFoundException(`Transaction with id "${id}" not found`);
    }

    return this.getById(id);
  }

  async deleteById(id: number): Promise<void> {
    const [result] = await this.db
      .delete(transactions)
      .where(eq(transactions.id, id));
    if (result.affectedRows === 0) {
      throw new NotFoundException(`Transaction with id "${id}" not found`);
    }
  }
}
