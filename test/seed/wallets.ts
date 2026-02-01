import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { wallets } from '../../src/drizzle/schema';

export const WALLET_SEED = [
  {
    id: 1,
    value: 50,
    active: true,
    createdAt: new Date('2025-08-14T10:00:00'),
    userId: 6,
    eventId: 3,
  },
  {
    id: 2,
    value: 100,
    active: true,
    createdAt: new Date('2025-07-17T10:00:00'),
    userId: 5,
    eventId: 3,
  },
  {
    id: 3,
    value: 50,
    active: true,
    createdAt: new Date('2025-08-14T10:00:00'),
    userId: 5,
    eventId: 2,
  },
];

export async function seedWallets(drizzle: DatabaseProvider) {
  await drizzle.insert(wallets).values(WALLET_SEED);
}

export async function clearWallets(drizzle: DatabaseProvider) {
  await drizzle.delete(wallets);
}
