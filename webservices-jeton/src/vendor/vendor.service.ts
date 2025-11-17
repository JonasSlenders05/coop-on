import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from 'src/drizzle/drizzle.provider';
import {
  PublicVendorResponseDto,
  UpdateVendorRequestDto,
  VendorListResponseDto,
} from './vendor.dto';
import { transactions, vendors } from 'src/drizzle/schema';
import { eq } from 'drizzle-orm';
import { TransactionResponseDto } from 'src/transaction/transaction.dto';

@Injectable()
export class VendorService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(): Promise<VendorListResponseDto> {
    const items = await this.db.query.vendors.findMany();
    return { items };
  }

  async getById(userId: number): Promise<PublicVendorResponseDto> {
    const vendor = await this.db.query.vendors.findFirst({
      where: eq(vendors.userId, userId),
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with id "${userId}" not found`);
    }

    return vendor;
  }

  async updateById(
    userId: number,
    changes: UpdateVendorRequestDto,
  ): Promise<PublicVendorResponseDto> {
    const [vendor] = await this.db
      .update(vendors)
      .set(changes)
      .where(eq(vendors.userId, userId));

    if (!vendor) {
      throw new NotFoundException(`Vendor ${userId} not found`);
    }

    return this.getById(userId);
  }

  async deleteById(userId: number): Promise<void> {
    const [result] = await this.db
      .delete(vendors)
      .where(eq(vendors.userId, userId));
    if (result.affectedRows === 0) {
      throw new NotFoundException('No event with this id exists');
    }
  }

  async getTransactionByVendorId(
    vendorId: number,
  ): Promise<TransactionResponseDto[]> {
    const walletTransactions = await this.db.query.transactions.findMany({
      where: eq(transactions.vendorId, vendorId),
    });
    return walletTransactions;
  }
}
