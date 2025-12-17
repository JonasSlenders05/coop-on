import { INestApplication } from '@nestjs/common';
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { organisers } from '../../src/drizzle/schema';

export const ORGANISER_SEED = [
  { userId: 5, organisation: 'Pop Events' },
  { userId: 6, organisation: 'EDM ligths' },
  { userId: 10, organisation: 'EventMaker' },
  { userId: 1, organisation: 'Coop-on' },
];

export async function seedOrganisers(
  app: INestApplication,
  drizzle: DatabaseProvider,
) {
  await drizzle.insert(organisers).values(ORGANISER_SEED);
}

export async function clearOrganisers(drizzle: DatabaseProvider) {
  await drizzle.delete(organisers);
}
