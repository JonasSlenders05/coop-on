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
import { events, wallets } from '../drizzle/schema';
import { PublicWalletResponseDto } from '../wallet/wallet.dto';
import { plainToInstance } from 'class-transformer';
import { PrivateRole } from '../auth/roles';

@Injectable()
export class EventService {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {}

  async getAll(id: number, roles: string[]): Promise<EventListResponseDto> {
    const isAdmin = roles.includes('admin');

    const items = await this.db.query.events.findMany({
      where: isAdmin ? undefined : eq(events.organiserId, id),
    });

    return { items };
  }

  async getById(
    id: number,
    userId: number,
    roles: string[],
  ): Promise<EventResponseDto> {
    const whereCondition = roles.includes(PrivateRole.ADMIN)
      ? eq(events.id, id)
      : and(eq(events.id, id), eq(events.organiserId, userId));

    const event = await this.db.query.events.findFirst({
      where: whereCondition,
    });

    if (!event) {
      throw new NotFoundException({
        message: 'No event with this id exists',
      });
    }

    return event;
  }

  async create(
    organiserId: number,
    event: CreateEventRequestDto,
    roles: string[],
  ): Promise<EventResponseDto> {
    const [newEvent] = await this.db
      .insert(events)
      .values({
        ...event,
        organiserId: organiserId,
      })
      .$returningId();

    return this.getById(newEvent.id, organiserId, roles);
  }

  async updateById(
    id: number,
    changes: UpdateEventRequestDto,
    organiserId: number,
    roles: string[],
  ): Promise<EventResponseDto> {
    await this.db.update(events).set(changes).where(eq(events.id, id));

    return this.getById(id, organiserId, roles);
  }

  async deleteById(
    id: number,
    organiserId: number,
    roles: string[],
  ): Promise<void> {
    const isAdmin = roles.includes('admin');

    const whereClause = isAdmin
      ? eq(events.id, id)
      : and(eq(events.id, id), eq(events.organiserId, organiserId));

    const result = await this.db.delete(events).where(whereClause);

    if (result[0].affectedRows === 0) {
      throw new NotFoundException('Event not found with this id');
    }
  }

  async getWalletsByEvent(eventId: number): Promise<PublicWalletResponseDto[]> {
    const eventWallets = await this.db.query.wallets.findMany({
      where: eq(wallets.eventId, eventId),
    });

    return eventWallets.map((wallet) =>
      plainToInstance(PublicWalletResponseDto, wallet, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
