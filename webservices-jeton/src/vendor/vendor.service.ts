import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';
import {
  PublicVendorResponseDto,
  UpdateVendorRequestDto,
  VendorListResponseDto,
} from './vendor.dto';
import { transactions, vendors } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { TransactionResponseDto } from '../transaction/transaction.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class VendorService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(): Promise<VendorListResponseDto> {
    const vendorList = await this.db.query.vendors.findMany({
      with: {
        user: true,
      },
    });
    const items = vendorList.map((vendors) =>
      plainToInstance(PublicVendorResponseDto, vendors, {
        excludeExtraneousValues: true,
      }),
    );
    return { items };
  }

  async getById(userId: number): Promise<PublicVendorResponseDto> {
    const vendor = await this.db.query.vendors.findFirst({
      where: eq(vendors.userId, userId),
      with: {
        user: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with this id does not exist`);
    }

    return plainToInstance(PublicVendorResponseDto, vendor, {
      excludeExtraneousValues: true,
    });
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
