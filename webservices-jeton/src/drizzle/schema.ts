import { sql } from 'drizzle-orm';
import {
  datetime,
  uniqueIndex,
  varchar,
  boolean,
} from 'drizzle-orm/mysql-core';
import { date, int } from 'drizzle-orm/mysql-core';
import { mysqlTable } from 'drizzle-orm/mysql-core';

export const events = mysqlTable(
  'events',
  {
    id: int('id', { unsigned: true }).primaryKey().autoincrement(),
    naam: varchar('naam', { length: 255 }).notNull(),
    locatie: varchar('locatie', { length: 255 }).notNull(),
    startDatum: date('startDatum').notNull(),
    eindDatum: date('eindDatum').notNull(),
  },
  (table) => [uniqueIndex('idx_event_name_unique').on(table.naam)],
);

export const customers = mysqlTable('customers', {
  id: int('id', { unsigned: true }).primaryKey().autoincrement(),
  voornaam: varchar('voornaam', { length: 255 }).notNull(),
  achternaam: varchar('achternaam', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  telefoon: varchar('telefoon', { length: 20 }).notNull(),
});

export const wallets = mysqlTable('wallets', {
  id: int('id', { unsigned: true }).primaryKey().autoincrement(),
  waarde: int('waarde', { unsigned: true }).notNull().default(0),
  status: boolean('status').notNull().default(true),
  gemaaktOp: datetime('gemaaktOp')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  customerId: int('customerId', { unsigned: true })
    .references(() => customers.id, { onDelete: 'cascade' })
    .notNull(),
  eventId: int('eventId', { unsigned: true })
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
});

export const transactions = mysqlTable('transactions', {
  id: int('id', { unsigned: true }).primaryKey().autoincrement(),
  datum: datetime('datum', { fsp: 3 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`),
  aantalBonnen: int('aantal_bonnen').notNull(),
  walletId: int('walletId', { unsigned: true })
    .references(() => wallets.id, { onDelete: 'cascade' })
    .notNull(),
  vendorId: int('eventId', { unsigned: true })
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
});

export const verkopers = mysqlTable('verkopers', {
  id: int('id', { unsigned: true }).primaryKey().autoincrement(),
  standNaam: varchar('voornaam', { length: 255 }).notNull(),
  voornaam: varchar('voornaam', { length: 255 }),
  achternaam: varchar('achternaam', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  telefoon: varchar('telefoon', { length: 20 }).notNull(),
});
