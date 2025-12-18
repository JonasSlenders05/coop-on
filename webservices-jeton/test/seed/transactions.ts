import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { transactions } from '../../src/drizzle/schema';

export const TRANSACTION_SEED = [
  {
    id: 1,
    date: new Date('2025-08-15T12:00:00'),
    amount: -8,
    walletId: 1,
    vendorId: 10,
    eventId: 2,
  },
  {
    id: 2,
    date: new Date('2025-07-18T15:00:00'),
    amount: -12,
    walletId: 2,
    vendorId: 10,
    eventId: 2,
  },
  {
    id: 3,
    date: new Date('2025-08-15T10:00:00.000Z'),
    amount: -8,
    walletId: 1,
    vendorId: 10,
    eventId: 2,
  },
  {
    id: 4,
    date: new Date('2025-08-15T10:00:00.000Z'),
    amount: -8,
    walletId: 1,
    vendorId: 11,
    eventId: 1,
  },
];

export async function seedTransactions(drizzle: DatabaseProvider) {
  await drizzle.insert(transactions).values(TRANSACTION_SEED);
}

export async function clearTransactions(drizzle: DatabaseProvider) {
  await drizzle.delete(transactions);
}
