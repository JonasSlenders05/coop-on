import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from 'src/drizzle/drizzle.provider';
import {
  CreateVendorRequestDto,
  UpdateVendorRequestDto,
  VendorListResponseDto,
  VendorResponseDto,
} from './vendor.dto';
import { transactions, vendors, wallets } from 'src/drizzle/schema';
import { eq } from 'drizzle-orm';
import { TransactionResponseDto } from 'src/transaction/transaction.dto';

@Injectable()
export class VendorService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(): Promise<VendorListResponseDto> {
    const items = await this.db.query.vendors.findMany();
    return { items };
  }

  async getById(id: number): Promise<VendorResponseDto> {
    const vendor = await this.db.query.vendors.findFirst({
      where: eq(vendors.id, id),
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with id "${id}" not found`);
    }

    return vendor;
  }

  async create(vendor: CreateVendorRequestDto): Promise<VendorResponseDto> {
    const [newVendor] = await this.db
      .insert(vendors)
      .values(vendor)
      .$returningId();

    return this.getById(newVendor.id);
  }

  async updateById(
    id: number,
    changes: UpdateVendorRequestDto,
  ): Promise<VendorResponseDto> {
    const [vendor] = await this.db
      .update(vendors)
      .set(changes)
      .where(eq(wallets.id, id));

    if (!vendor) {
      throw new NotFoundException(`Vendor ${id} not found`);
    }

    return this.getById(id);
  }

  async deleteById(id: number): Promise<void> {
    const [result] = await this.db.delete(vendors).where(eq(vendors.id, id));
    if (result.affectedRows === 0) {
      throw new NotFoundException('No event with this id exists');
    }
  }

  async getTransactionByVendorId(
    vendorId: number,
  ): Promise<TransactionResponseDto[]> {
    const walletTransactions = await this.db.query.transactions.findMany({
      where: eq(transactions.vendorId, vendorId),
      with: {
        wallet: true,
        vendor: true,
      },
    });
    return walletTransactions;
  }
}
