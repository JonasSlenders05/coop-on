import { INestApplication } from '@nestjs/common';
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { vendors } from '../../src/drizzle/schema';

export const VENDOR_SEED = [
  { userId: 10, boothName: 'Mario Pizza' },
  { userId: 11, boothName: 'Luigi Kebab' },
];

export async function seedVendors(
  app: INestApplication,
  drizzle: DatabaseProvider,
) {
  await drizzle.insert(vendors).values(VENDOR_SEED);
}

export async function clearVendors(drizzle: DatabaseProvider) {
  await drizzle.delete(vendors);
}
