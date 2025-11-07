import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema';

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 5,
});

const db = drizzle(connection, {
  schema,
  mode: 'default',
});

async function resetDatabase() {
  console.log('🗑️ Resetting database...');

  await db.delete(schema.events);

  console.log('✅ Database reset completed\n');
}

async function seedEvents() {
  console.log('📍 Seeding events...');

  await db.insert(schema.events).values([
    {
      id: 1,
      naam: 'Pukkelpop',
      locatie: 'Kiewit',
      startDatum: new Date('2025-08-15'),
      eindDatum: new Date('2025-08-17'),
    },
    {
      id: 2,
      naam: 'Rock Werchter',
      locatie: 'Werchter',
      startDatum: new Date('2025-07-03'),
      eindDatum: new Date('2025-07-06'),
    },
    {
      id: 3,
      naam: 'Tomorrowland',
      locatie: 'Boom',
      startDatum: new Date('2025-07-18'),
      eindDatum: new Date('2025-07-27'),
    },
  ]);

  console.log('✅ Events seeded successfully\n');
} // 👈 deze accolade ontbrak

async function main() {
  console.log('🌱 Starting database seeding...\n');

  await resetDatabase();
  await seedEvents();

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .then(async () => {
    await connection.end();
  })
  .catch(async (e) => {
    console.error(e);
    await connection.end();
    process.exit(1);
  });
