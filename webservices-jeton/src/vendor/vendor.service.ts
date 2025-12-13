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
import { vendors } from '../drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';
import { PrivateRole } from '../auth/roles';

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
    currentUserId: number,
    vendorId: number,
    changes: UpdateVendorRequestDto,
    roles: string[],
  ): Promise<PublicVendorResponseDto> {
    await this.verifyAcces(currentUserId, vendorId, roles);

    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const [vendor] = await this.db
      .update(vendors)
      .set(changes)
      .where(
        and(
          isAdmin ? undefined : eq(vendors.userId, currentUserId),
          eq(vendors.userId, vendorId),
        ),
      );

    if (!vendor) {
      throw new NotFoundException(`Vendor ${vendorId} not found`);
    }

    return this.getById(currentUserId);
  }

  async deleteById(
    currentUserId: number,
    vendorId: number,
    roles: string[],
  ): Promise<void> {
    await this.verifyAcces(currentUserId, vendorId, roles);

    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const [result] = await this.db
      .delete(vendors)
      .where(
        and(
          isAdmin ? undefined : eq(vendors.userId, currentUserId),
          eq(vendors.userId, vendorId),
        ),
      );
    if (result.affectedRows === 0) {
      throw new NotFoundException('No event with this id exists');
    }
  }

  async verifyAcces(
    currentUserId: number,
    vendorId: number,
    roles: string[],
  ): Promise<void> {
    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const vendor = await this.db.query.vendors.findFirst({
      where: and(
        eq(vendors.userId, vendorId),
        isAdmin ? undefined : eq(vendors.userId, currentUserId),
      ),
    });

    if (!vendor) {
      throw new NotFoundException('No vendor with this id found');
    }
  }
}
