import { relations } from 'drizzle-orm';
import {
  uniqueIndex,
  varchar,
  boolean,
  timestamp,
} from 'drizzle-orm/mysql-core';
import { date, int } from 'drizzle-orm/mysql-core';
import { mysqlTable } from 'drizzle-orm/mysql-core';

export const events = mysqlTable(
  'events',
  {
    id: int('id', { unsigned: true }).primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }).notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    startDate: date('startDate').notNull(),
    endDate: date('endDate').notNull(),
  },
  (table) => [uniqueIndex('idx_event_name_unique').on(table.name)],
);

export const customers = mysqlTable(
  'customers',
  {
    id: int('id', { unsigned: true }).primaryKey().autoincrement(),
    firstname: varchar('firstname', { length: 255 }).notNull(),
    lastname: varchar('lastname', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phonenumber: varchar('phonenumber', { length: 20 }).notNull(),
  },
  (table) => [uniqueIndex('idx_customer_email_unique').on(table.email)],
);

export const wallets = mysqlTable(
  'wallets',
  {
    id: int('id', { unsigned: true }).primaryKey().autoincrement(),
    value: int('value', { unsigned: true }).notNull().default(0),
    state: boolean('status').notNull().default(true),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    customerId: int('customerId', { unsigned: true })
      .references(() => customers.id, { onDelete: 'cascade' })
      .notNull(),
    eventId: int('eventId', { unsigned: true })
      .references(() => events.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    uniqueIndex('idx_unique_wallet_per_customer_event').on(
      table.customerId,
      table.eventId,
    ),
  ],
);

export const vendors = mysqlTable(
  'vendors',
  {
    id: int('id', { unsigned: true }).primaryKey().autoincrement(),
    boothName: varchar('boothName', { length: 255 }).notNull(),
    firstname: varchar('firstname', { length: 255 }),
    lastname: varchar('lastname', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull(),
    phonenumber: varchar('phonenumber', { length: 20 }).notNull(),
  },
  (table) => [uniqueIndex('idx_verkoper_name_unique').on(table.boothName)],
);

export const transactions = mysqlTable('transactions', {
  id: int('id', { unsigned: true }).primaryKey().autoincrement(),
  date: timestamp('date', { mode: 'date' }).defaultNow().notNull(),
  amount: int('amount').notNull(),
  walletId: int('walletId', { unsigned: true })
    .references(() => wallets.id, { onDelete: 'cascade' })
    .notNull(),
  vendorId: int('vendorId', { unsigned: true })
    .references(() => vendors.id, { onDelete: 'cascade' })
    .notNull(),
});

export const eventsRelations = relations(events, ({ many }) => ({
  wallets: many(wallets),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  event: one(events, {
    fields: [wallets.eventId],
    references: [events.id],
  }),
  customer: one(customers, {
    fields: [wallets.customerId],
    references: [customers.id],
  }),
  transactions: many(transactions),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  wallets: many(wallets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
  vendor: one(vendors, {
    fields: [transactions.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  transactions: many(transactions),
}));
