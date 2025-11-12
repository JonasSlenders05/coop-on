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

  await db.delete(schema.transactions);
  await db.delete(schema.wallets);
  await db.delete(schema.vendors);
  await db.delete(schema.customers);
  await db.delete(schema.events);

  console.log('✅ Database reset completed\n');
}

async function seedEvents() {
  console.log('📍 Seeding events...');

  await db.insert(schema.events).values([
    {
      id: 1,
      name: 'Pukkelpop',
      location: 'Kiewit',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2025-08-17'),
    },
    {
      id: 2,
      name: 'Rock Werchter',
      location: 'Werchter',
      startDate: new Date('2025-07-03'),
      endDate: new Date('2025-07-06'),
    },
    {
      id: 3,
      name: 'Tomorrowland',
      location: 'Boom',
      startDate: new Date('2025-07-18'),
      endDate: new Date('2025-07-27'),
    },
  ]);

  console.log('✅ Events seeded successfully\n');
}

async function seedCustomers() {
  console.log('👥 Seeding customers...');

  await db.insert(schema.customers).values([
    {
      id: 1,
      firstname: 'Jan',
      lastname: 'Jansens',
      email: 'janjansens@gmail.com',
      phonenumber: '+32 471 62 04 35',
    },
    {
      id: 2,
      firstname: 'Jasper',
      lastname: 'Jaspers',
      email: 'jasperjaspers@gmail.com',
      phonenumber: '+32 478 42 03 05',
    },
    {
      id: 3,
      firstname: 'Gabriel',
      lastname: 'Gabriels',
      email: 'gabrielgabriels@gmail.com',
      phonenumber: '+32 473 62 34 63',
    },
  ]);

  console.log('✅ Customers seeded successfully\n');
}

async function seedWallets() {
  console.log('💳 Seeding wallets...');

  await db.insert(schema.wallets).values([
    { id: 1, value: 25, state: true, customerId: 1, eventId: 1 },
    { id: 2, value: 40, state: true, customerId: 2, eventId: 1 },
    { id: 3, value: 10, state: true, customerId: 3, eventId: 1 },
    { id: 4, value: 50, state: true, customerId: 1, eventId: 2 },
  ]);

  console.log('✅ Wallets seeded successfully\n');
}

async function seedVendors() {
  console.log('🏪 Seeding vendors...');

  await db.insert(schema.vendors).values([
    {
      id: 1,
      boothName: 'Bierbar Pintje',
      firstname: 'Tom',
      lastname: 'Bierman',
      email: 'tom@pintje.be',
      phonenumber: '+32 476 45 32 10',
    },
    {
      id: 2,
      boothName: 'Frietkot Frituurke',
      firstname: 'Lotte',
      lastname: 'Peeters',
      email: 'lotte@frituurke.be',
      phonenumber: '+32 495 12 45 22',
    },
    {
      id: 3,
      boothName: 'Pizza Mario',
      firstname: 'Mario',
      lastname: 'Luigi',
      email: 'mario@pizza.be',
      phonenumber: '+32 478 99 77 55',
    },
  ]);

  console.log('✅ Vendors seeded successfully\n');
}

async function seedTransactions() {
  console.log('💸 Seeding transactions...');

  await db.insert(schema.transactions).values([
    {
      id: 1,
      date: new Date('2025-07-01T18:45:23.123Z'),
      amount: -5,
      walletId: 1,
      vendorId: 1,
    },
    {
      id: 2,
      date: new Date('2025-07-01T19:02:10.456Z'),
      amount: -8,
      walletId: 2,
      vendorId: 2,
    },
    {
      id: 3,
      date: new Date('2025-07-01T19:15:54.789Z'),
      amount: -6,
      walletId: 3,
      vendorId: 3,
    },
    {
      id: 4,
      date: new Date('2025-07-01T20:05:00.321Z'),
      amount: 20,
      walletId: 1,
      vendorId: 1,
    },
  ]);

  console.log('✅ Transactions seeded successfully\n');
}

async function main() {
  console.log('🌱 Starting database seeding...\n');

  await resetDatabase();
  await seedEvents();
  await seedCustomers();
  await seedWallets();
  await seedVendors();
  await seedTransactions();

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
