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
import { eq } from 'drizzle-orm';
import { events } from '../drizzle/schema';

@Injectable()
export class EventService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(): Promise<EventListResponseDto> {
    const items = await this.db.query.events.findMany();
    return { items };
  }

  async getById(id: number): Promise<EventResponseDto> {
    const event = await this.db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!event) {
      throw new NotFoundException({
        message: 'No event with this id exists',
      });
    }

    return event;
  }

  async create(event: CreateEventRequestDto): Promise<EventResponseDto> {
    const [newEvent] = await this.db
      .insert(events)
      .values(event)
      .$returningId();

    return this.getById(newEvent.id);
  }

  async updateById(
    id: number,
    changes: UpdateEventRequestDto,
  ): Promise<EventResponseDto> {
    await this.db.update(events).set(changes).where(eq(events.id, id));

    return this.getById(id);
  }

  async deleteById(id: number): Promise<void> {
    const [result] = await this.db.delete(events).where(eq(events.id, id));
    if (result.affectedRows === 0) {
      throw new NotFoundException('No event with this id exists');
    }
  }
}
