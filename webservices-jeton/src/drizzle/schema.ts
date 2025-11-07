import { uniqueIndex, varchar } from 'drizzle-orm/mysql-core';
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
