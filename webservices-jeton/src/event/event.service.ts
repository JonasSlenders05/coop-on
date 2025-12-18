import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateEventRequestDto,
  EventListResponseDto,
  EventResponseDto,
  UpdateEventRequestDto,
} from './event.dto';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';
import { and, eq } from 'drizzle-orm';
import { events } from '../drizzle/schema';
import { plainToInstance } from 'class-transformer';
import { PrivateRole } from '../auth/roles';

@Injectable()
export class EventService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(): Promise<EventListResponseDto> {
    const items = await this.db.query.events.findMany({
      with: {
        organiser: true,
      },
    });
    return {
      items: items.map((item) =>
        plainToInstance(EventResponseDto, item, {
          excludeExtraneousValues: true,
        }),
      ),
    };
  }

  async getById(eventId: number): Promise<EventResponseDto> {
    const event = await this.db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        organiser: true,
      },
    });

    if (!event) {
      throw new NotFoundException('No event with this id exists');
    }

    return plainToInstance(EventResponseDto, event, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    organiserId: number,
    event: CreateEventRequestDto,
  ): Promise<EventResponseDto> {
    const [newEvent] = await this.db
      .insert(events)
      .values({
        ...event,
        organiserId: organiserId,
      })
      .$returningId();

    return this.getById(newEvent.id);
  }

  async updateById(
    eventId: number,
    changes: UpdateEventRequestDto,
    organiserId: number,
    roles: string[],
  ): Promise<EventResponseDto> {
    await this.verifyAccess(organiserId, eventId, roles);

    const isAdmin = roles.includes(PrivateRole.ADMIN);
    const [result] = await this.db
      .update(events)
      .set(changes)
      .where(
        and(
          eq(events.id, eventId),
          isAdmin ? undefined : eq(events.organiserId, organiserId),
        ),
      );
    if (!result) {
      throw new NotFoundException('No event with this id found');
    }

    return this.getById(eventId);
  }

  async deleteById(
    currentUserId: number,
    eventId: number,
    roles: string[],
  ): Promise<void> {
    await this.verifyAccess(currentUserId, eventId, roles);

    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const whereClause = isAdmin
      ? eq(events.id, eventId)
      : and(eq(events.id, eventId), eq(events.organiserId, currentUserId));

    const result = await this.db.delete(events).where(whereClause);

    if (result[0].affectedRows === 0) {
      throw new NotFoundException('Event not found with this id');
    }
  }

  async getEventsByOrganiserId(
    currentUserId: number,
    organiserId: number,
    roles: string[],
  ): Promise<EventResponseDto[]> {
    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const eventsOfOrganiser = await this.db.query.events.findMany({
      where: isAdmin
        ? eq(events.organiserId, organiserId)
        : and(
            eq(events.organiserId, currentUserId),
            eq(events.organiserId, organiserId),
          ),
      with: {
        organiser: true,
      },
    });

    return plainToInstance(EventResponseDto, eventsOfOrganiser, {
      excludeExtraneousValues: true,
    });
  }

  async verifyAccess(
    currentUserId: number,
    eventId: number,
    roles: string[],
  ): Promise<void> {
    const isAdmin = roles.includes(PrivateRole.ADMIN);

    const event = await this.db.query.events.findFirst({
      where: and(
        eq(events.id, eventId),
        isAdmin ? undefined : eq(events.organiserId, currentUserId),
      ),
    });

    if (!event) {
      throw new NotFoundException('No event with this id found');
    }
  }
}
