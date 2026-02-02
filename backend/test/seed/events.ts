import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { events } from '../../src/drizzle/schema';

export const EVENTS_SEED = [
  {
    id: 1,
    name: 'Pukkelpop',
    location: 'Kiewit',
    startDate: new Date('2025-08-15'),
    endDate: new Date('2025-08-17'),
    organiserId: 6,
  },
  {
    id: 2,
    name: 'Rock Werchter',
    location: 'Werchter',
    startDate: new Date('2025-07-03'),
    endDate: new Date('2025-07-06'),
    organiserId: 6,
  },
  {
    id: 3,
    name: 'Tomorrow Land',
    location: 'Boom',
    startDate: new Date('2025-08-03'),
    endDate: new Date('2025-08-06'),
    organiserId: 1,
  },
];

export async function seedEvents(drizzle: DatabaseProvider) {
  await drizzle.insert(events).values(EVENTS_SEED);
}

export async function clearEvents(drizzle: DatabaseProvider) {
  await drizzle.delete(events);
}
