import { relations } from 'drizzle-orm';
import {
  int,
  varchar,
  boolean,
  date,
  timestamp,
  json,
} from 'drizzle-orm/mysql-core';
import { mysqlTable, uniqueIndex } from 'drizzle-orm/mysql-core';

export const users = mysqlTable(
  'users',
  {
    id: int('id').primaryKey().autoincrement(),
    firstname: varchar('firstname', { length: 255 }).notNull(),
    lastname: varchar('lastname', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phonenumber: varchar('phonenumber', { length: 20 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    publicRoles: json('public_roles').notNull(),
    privateRoles: json('private_roles').notNull(),
  },
  (table) => [uniqueIndex('uniq_user_email').on(table.email)],
);

export const vendors = mysqlTable(
  'vendors',
  {
    boothName: varchar('boothName', { length: 255 }).notNull(),
    userId: int('userId')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [uniqueIndex('uniq_vendor_userId').on(table.userId)],
);

export const organisers = mysqlTable(
  'organisers',
  {
    userId: int('userId')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    organisation: varchar('organisation', { length: 255 }).notNull(),
  },
  (table) => [uniqueIndex('uniq_organiser_userId').on(table.userId)],
);

export const events = mysqlTable(
  'events',
  {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }).notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    startDate: date('startDate').notNull(),
    endDate: date('endDate').notNull(),
    organiserId: int('organiserId')
      .references(() => organisers.userId, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [uniqueIndex('uniq_event_name').on(table.name)],
);

export const wallets = mysqlTable(
  'wallets',
  {
    id: int('id').primaryKey().autoincrement(),
    value: int('value', { unsigned: true }).notNull().default(0),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    userId: int('userId')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    eventId: int('eventId')
      .references(() => events.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    uniqueIndex('uniq_wallet_per_customer_event').on(
      table.userId,
      table.eventId,
    ),
  ],
);

export const transactions = mysqlTable('transactions', {
  id: int('id').primaryKey().autoincrement(),
  date: timestamp('date', { mode: 'date' }).defaultNow().notNull(),
  amount: int('amount').notNull(),
  walletId: int('walletId')
    .references(() => wallets.id, { onDelete: 'cascade' })
    .notNull(),
  vendorId: int('vendorId')
    .references(() => vendors.userId, { onDelete: 'cascade' })
    .notNull(),

  eventId: int('eventId')
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  vendors: many(vendors),
  organisers: many(organisers),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, { fields: [vendors.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const organisersRelations = relations(organisers, ({ one, many }) => ({
  user: one(users, { fields: [organisers.userId], references: [users.id] }),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ many, one }) => ({
  organiser: one(organisers, {
    fields: [events.organiserId],
    references: [organisers.userId],
  }),
  wallets: many(wallets),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  event: one(events, { fields: [wallets.eventId], references: [events.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
  vendor: one(vendors, {
    fields: [transactions.vendorId],
    references: [vendors.userId],
  }),
  event: one(events, {
    fields: [transactions.eventId],
    references: [events.id],
  }),
}));
