import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema';
import * as argon2 from 'argon2';
import { Role } from 'src/auth/roles';

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
  await db.delete(schema.organisers);
  await db.delete(schema.users);
  await db.delete(schema.events);
  console.log('✅ Database reset completed\n');
}

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    hashLength: 32,
    timeCost: 2,
    memoryCost: 2 ** 16,
  });
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  await db.insert(schema.users).values([
    {
      id: 1,
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@coop-on.be',
      phonenumber: '+32478123456',
      passwordHash: await hashPassword('12345678'),
      roles: [Role.ADMIN, Role.CUSTOMER, Role.VENDOR, Role.ORGANISER],
    },
    {
      id: 2,
      firstname: 'Pieter',
      lastname: 'Van Der Helst',
      email: 'pieter@pintje.be',
      phonenumber: '+32484751234',
      passwordHash: await hashPassword('12345678'),
      roles: [Role.VENDOR],
    },
    {
      id: 3,
      firstname: 'Karine',
      lastname: 'Samyn',
      email: 'karine@frituurke.be',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      roles: [Role.VENDOR],
    },
    {
      id: 4,
      firstname: 'Mario',
      lastname: 'Pizza',
      email: 'mario@pizza.be',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      roles: [Role.VENDOR],
    },
    {
      id: 5,
      firstname: 'Frank',
      lastname: 'Vandenbroeke',
      email: 'frank@pukkelpop.be',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      roles: [Role.ORGANISER],
    },
    {
      id: 6,
      firstname: 'Dimitri',
      lastname: 'Miami',
      email: 'dimitri@tommorowland.be',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      roles: [Role.ORGANISER],
    },
    {
      id: 10,
      firstname: 'Kees',
      lastname: 'Ketsers',
      email: 'kees@werchter.be',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      roles: [Role.ORGANISER],
    },
    {
      id: 7,
      firstname: 'Jan',
      lastname: 'Janssen',
      email: 'janjanssen@gmail.com',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      roles: [Role.CUSTOMER],
    },
    {
      id: 8,
      firstname: 'Jasper',
      lastname: 'Jaspers',
      email: 'jasperjaspers@gmail.com',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      roles: [Role.CUSTOMER],
    },
    {
      id: 9,
      firstname: 'Piet',
      lastname: 'Pieters',
      email: 'pietpieters@gmail.com',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      roles: [Role.CUSTOMER],
    },
  ]);
  console.log('✅ Users seeded successfully\n');
}

async function seedOrganisers() {
  console.log('📋 Seeding organisers...');
  await db.insert(schema.organisers).values([
    { userId: 5, organisation: 'Pop Events' },
    { userId: 6, organisation: 'EDM ligths' },
    { userId: 10, organisation: 'EventMaker' },
  ]);
  console.log('✅ Organisers seeded successfully\n');
}

async function seedVendors() {
  console.log('🏪 Seeding vendors...');
  await db.insert(schema.vendors).values([
    { userId: 2, boothName: 'Bierbar Pintje' },
    { userId: 3, boothName: 'Frietkot Frituurke' },
    { userId: 4, boothName: 'Pizza Mario' },
  ]);
  console.log('✅ Vendors seeded successfully\n');
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
      organiserId: 5,
    },
    {
      id: 2,
      name: 'Rock Werchter',
      location: 'Werchter',
      startDate: new Date('2025-07-03'),
      endDate: new Date('2025-07-06'),
      organiserId: 10,
    },
    {
      id: 3,
      name: 'Tomorrowland',
      location: 'Boom',
      startDate: new Date('2025-07-18'),
      endDate: new Date('2025-07-27'),
      organiserId: 6,
    },
  ]);
  console.log('✅ Events seeded successfully\n');
}

async function seedWallets() {
  console.log('💳 Seeding wallets...');
  await db.insert(schema.wallets).values([
    {
      id: 1,
      value: 50,
      state: true,
      createdAt: new Date(),
      userId: 1,
      eventId: 1,
    },
    {
      id: 2,
      value: 30,
      state: true,
      createdAt: new Date(),
      userId: 2,
      eventId: 1,
    },
    {
      id: 3,
      value: 20,
      state: true,
      createdAt: new Date(),
      userId: 3,
      eventId: 2,
    },
    {
      id: 4,
      value: 70,
      state: true,
      createdAt: new Date(),
      userId: 1,
      eventId: 3,
    },
  ]);
  console.log('✅ Wallets seeded successfully\n');
}

async function seedTransactions() {
  console.log('💸 Seeding transactions...');
  await db.insert(schema.transactions).values([
    {
      id: 1,
      date: new Date('2025-07-01T12:00:00'),
      amount: -10,
      walletId: 1,
      vendorId: 2,
    },
    {
      id: 2,
      date: new Date('2025-07-01T12:15:00'),
      amount: -15,
      walletId: 2,
      vendorId: 3,
    },
    {
      id: 3,
      date: new Date('2025-07-01T12:30:00'),
      amount: -5,
      walletId: 3,
      vendorId: 4,
    },
    {
      id: 4,
      date: new Date('2025-07-01T13:00:00'),
      amount: 25,
      walletId: 1,
      vendorId: 2,
    },
  ]);
  console.log('✅ Transactions seeded successfully\n');
}

async function main() {
  console.log('🌱 Starting database seeding...\n');
  await resetDatabase();
  await seedUsers();
  await seedOrganisers();
  await seedVendors();
  await seedEvents();
  await seedWallets();
  await seedTransactions();
  console.log('🎉 Database seeding completed successfully!');
  await connection.end();
}

main().catch(async (e) => {
  console.error(e);
  await connection.end();
  process.exit(1);
});
