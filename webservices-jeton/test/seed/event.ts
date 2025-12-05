// /test/seeds/places.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { events } from '../../src/drizzle/schema';

export const EVENTS_SEED = [
  {
    id: 1,
    name: 'Pukkelpop',
    location: 'Kiewit',
    startDate: new Date('2025-08-15'),
    endDate: new Date('2025-08-17'),
    organiserId: 5,
  },
  {
    id: 2,
    name: 'Rock Werchter',
    location: 'Werchter',
    startDate: new Date('2025-07-03'),
    endDate: new Date('2025-07-06'),
    organiserId: 10,
  },
];

export async function seedEvents(drizzle: DatabaseProvider) {
  await drizzle.insert(events).values(EVENTS_SEED);
}

export async function clearEvents(drizzle: DatabaseProvider) {
  await drizzle.delete(events);
}
