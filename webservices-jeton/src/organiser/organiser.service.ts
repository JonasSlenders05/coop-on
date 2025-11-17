import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from 'src/drizzle/drizzle.provider';
import {
  OrganiserListResponseDto,
  OrganiserResponseDto,
  UpdateOrganiserRequestDto,
} from './organiser.dto';
import { events, organisers } from 'src/drizzle/schema';
import { eq } from 'drizzle-orm';
import { EventResponseDto } from 'src/event/event.dto';

@Injectable()
export class OrganiserService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(): Promise<OrganiserListResponseDto> {
    const items = await this.db.query.organisers.findMany();
    return { items };
  }

  async getById(userId: number): Promise<OrganiserResponseDto> {
    const organiser = await this.db.query.organisers.findFirst({
      where: eq(organisers.userId, userId),
    });

    if (!organiser) {
      throw new NotFoundException('No organiser with this id found');
    }

    return organiser;
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
      throw new NotFoundException('Organiser with this id not found');
    }

    return this.getById(userId);
  }

  async deleteById(userId: number): Promise<void> {
    const [result] = await this.db
      .delete(organisers)
      .where(eq(organisers.userId, userId));
    if (result.affectedRows === 0) {
      throw new NotFoundException('No event with this id exists');
    }
  }

  async getEventsByOrganiserId(
    organiserId: number,
  ): Promise<EventResponseDto[]> {
    const eventOrganisers = await this.db.query.events.findMany({
      where: eq(events.organiserId, organiserId),
    });
    return eventOrganisers;
  }
}
