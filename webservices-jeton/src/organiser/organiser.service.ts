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
import { events, organisers } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { EventResponseDto } from '../event/event.dto';
import { plainToInstance } from 'class-transformer';

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

  async getById(userId: number): Promise<OrganiserResponseDto> {
    const organiser = await this.db.query.organisers.findFirst({
      where: eq(organisers.userId, userId),
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
    changes: UpdateOrganiserRequestDto,
  ): Promise<OrganiserResponseDto> {
    const [organiser] = await this.db
      .update(organisers)
      .set(changes)
      .where(eq(organisers.userId, userId));
    if (!organiser) {
      throw new NotFoundException('No organiser with this id exists');
    }

    return this.getById(userId);
  }

  async deleteById(userId: number): Promise<void> {
    const [result] = await this.db
      .delete(organisers)
      .where(eq(organisers.userId, userId));
    if (result.affectedRows === 0) {
      throw new NotFoundException('No organiser with this id exists');
    }
  }

  async getEventsByOrganiserId(
    organiserId: number,
  ): Promise<EventResponseDto[]> {
    await this.getById(organiserId);

    const eventsForOrganiser = await this.db.query.events.findMany({
      where: eq(events.organiserId, organiserId),
    });

    return eventsForOrganiser;
  }
}
