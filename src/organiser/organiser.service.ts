import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';
import {
  OrganiserListResponseDto,
  OrganiserResponseDto,
  UpdateOrganiserRequestDto,
} from './organiser.dto';
import { organisers } from '../drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';
import { PrivateRole } from '../auth/roles';

@Injectable()
export class OrganiserService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(): Promise<OrganiserListResponseDto> {
    const organiserList = await this.db.query.organisers.findMany({
      with: {
        user: true,
      },
    });
    const items = organiserList.map((organiser) =>
      plainToInstance(OrganiserResponseDto, organiser, {
        excludeExtraneousValues: true,
      }),
    );
    return { items };
  }

  async getById(
    currentUserId: number,
    organiserId: number,
    roles: string[],
  ): Promise<OrganiserResponseDto> {
    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const organiser = await this.db.query.organisers.findFirst({
      where: isAdmin
        ? eq(organisers.userId, organiserId)
        : and(
            eq(organisers.userId, currentUserId),
            eq(organisers.userId, organiserId),
          ),
      with: {
        user: true,
      },
    });

    if (!organiser) {
      throw new NotFoundException('No organiser with this id exists');
    }

    return plainToInstance(OrganiserResponseDto, organiser, {
      excludeExtraneousValues: true,
    });
  }

  async updateById(
    userId: number,
    organiserId: number,
    changes: UpdateOrganiserRequestDto,
    roles: string[],
  ): Promise<OrganiserResponseDto> {
    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const [organiser] = await this.db
      .update(organisers)
      .set(changes)
      .where(isAdmin ? undefined : eq(organisers.userId, organiserId));

    if (!organiser) {
      throw new NotFoundException('No organiser with this id exists');
    }

    return this.getById(userId, organiserId, roles);
  }

  async deleteById(userId: number, roles: string[]): Promise<void> {
    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const [result] = await this.db
      .delete(organisers)
      .where(isAdmin ? undefined : eq(organisers.userId, userId));
    if (result.affectedRows === 0) {
      throw new NotFoundException('No organiser with this id exists');
    }
  }
}
