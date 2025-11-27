import { Injectable, NotFoundException } from '@nestjs/common';
import {
  UpdateUserRequestDto,
  UserListResponseDto,
  PublicUserResponseDto,
} from './user.dto';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';
import { users, wallets } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';
import { PublicWalletResponseDto } from 'src/wallet/wallet.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
  ) {}

  async getAll(): Promise<UserListResponseDto> {
    const usersList = await this.db.query.users.findMany();
    const items = usersList.map((user) =>
      plainToInstance(PublicUserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    );
    return { items };
  }

  async getById(id: number): Promise<PublicUserResponseDto> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundException('No user with this id exists');
    }

    return plainToInstance(PublicUserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async deleteById(id: number): Promise<void> {
    const [result] = await this.db.delete(users).where(eq(users.id, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException('No user with this id exists');
    }
  }

  async updateById(
    id: number,
    changes: UpdateUserRequestDto,
  ): Promise<PublicUserResponseDto> {
    const [result] = await this.db
      .update(users)
      .set(changes)
      .where(eq(users.id, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException('No user with this id exists');
    }

    return this.getById(id);
  }

  async getWalletsByUserId(id: number): Promise<PublicWalletResponseDto[]> {
    await this.getById(id);

    const userWallets = await this.db.query.wallets.findMany({
      where: eq(wallets.userId, id),
      with: {
        user: true,
        event: true,
      },
    });

    return userWallets.map((w) =>
      plainToInstance(PublicWalletResponseDto, w, {
        excludeExtraneousValues: true,
      }),
    );
  }

  // async getVendorByUserId(id: number): Promise<PublicVendorResponseDto> {
  //   await this.getById(id);

  //   const vendorUser = await this.db.query.vendors.findFirst({
  //     where: eq(vendors.userId, id),
  //     with: {
  //       user: true,
  //     },
  //   });

  //   if (!vendorUser) {
  //     throw new NotFoundException('No vendor with this id exists');
  //   }

  //   return plainToInstance(PublicVendorResponseDto, vendorUser, {
  //     excludeExtraneousValues: true,
  //   });
  // }

  // async getOrganiserByUserId(id: number): Promise<OrganiserResponseDto> {
  //   await this.getById(id);

  //   const organiserUser = await this.db.query.vendors.findFirst({
  //     where: eq(organisers.userId, id),
  //     with: {
  //       user: true,
  //     },
  //   });

  //   if (!organiserUser) {
  //     throw new NotFoundException('No organiser with this id exists');
  //   }

  //   return plainToInstance(OrganiserResponseDto, organiserUser, {
  //     excludeExtraneousValues: true,
  //   });
  // }
}
