import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema';
import * as argon2 from 'argon2';
import { PrivateRole, PublicRole } from 'src/auth/roles';

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
      publicRoles: [
        PublicRole.VENDOR,
        PublicRole.ORGANISER,
        PublicRole.CUSTOMER,
      ],
      privateRoles: [PrivateRole.ADMIN, PrivateRole.USER],
    },
    {
      id: 2,
      firstname: 'Pieter',
      lastname: 'Van Der Helst',
      email: 'pieter@pintje.be',
      phonenumber: '+32484751234',
      passwordHash: await hashPassword('12345678'),
      privateRoles: [PrivateRole.USER],
      publicRoles: [PublicRole.VENDOR],
    },
    {
      id: 3,
      firstname: 'Karine',
      lastname: 'Samyn',
      email: 'karine@frituurke.be',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      publicRoles: [PublicRole.VENDOR],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 4,
      firstname: 'Mario',
      lastname: 'Pizza',
      email: 'mario@pizza.be',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      publicRoles: [PublicRole.VENDOR],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 5,
      firstname: 'Frank',
      lastname: 'Vandenbroeke',
      email: 'frank@pukkelpop.be',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      publicRoles: [PublicRole.ORGANISER],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 6,
      firstname: 'Dimitri',
      lastname: 'Miami',
      email: 'dimitri@tommorowland.be',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      publicRoles: [PublicRole.ORGANISER],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 10,
      firstname: 'Kees',
      lastname: 'Ketsers',
      email: 'kees@werchter.be',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      publicRoles: [PublicRole.ORGANISER],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 7,
      firstname: 'Jan',
      lastname: 'Janssen',
      email: 'janjanssen@gmail.com',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      publicRoles: [PublicRole.CUSTOMER],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 8,
      firstname: 'Jasper',
      lastname: 'Jaspers',
      email: 'jasperjaspers@gmail.com',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      publicRoles: [PublicRole.CUSTOMER],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 9,
      firstname: 'Piet',
      lastname: 'Pieters',
      email: 'pietpieters@gmail.com',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      publicRoles: [PublicRole.CUSTOMER],
      privateRoles: [PrivateRole.USER],
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
    // Pukkelpop wallets
    {
      id: 1,
      value: 50,
      active: true,
      createdAt: new Date('2025-08-14T10:00:00'),
      userId: 7, // Jan Janssen
      eventId: 1,
    },
    {
      id: 2,
      value: 75,
      active: true,
      createdAt: new Date('2025-08-14T10:15:00'),
      userId: 8, // Jasper Jaspers
      eventId: 1,
    },
    {
      id: 3,
      value: 100,
      active: true,
      createdAt: new Date('2025-08-14T10:30:00'),
      userId: 9, // Piet Pieters
      eventId: 1,
    },
    {
      id: 4,
      value: 25,
      active: true,
      createdAt: new Date('2025-08-14T11:00:00'),
      userId: 1, // Admin
      eventId: 1,
    },

    // Rock Werchter wallets
    {
      id: 5,
      value: 60,
      active: true,
      createdAt: new Date('2025-07-02T09:00:00'),
      userId: 7, // Jan Janssen
      eventId: 2,
    },
    {
      id: 6,
      value: 80,
      active: true,
      createdAt: new Date('2025-07-02T09:30:00'),
      userId: 8, // Jasper Jaspers
      eventId: 2,
    },
    {
      id: 7,
      value: 45,
      active: true,
      createdAt: new Date('2025-07-02T10:00:00'),
      userId: 9, // Piet Pieters
      eventId: 2,
    },
    {
      id: 8,
      value: 120,
      active: false, // Inactive wallet
      createdAt: new Date('2025-07-02T10:30:00'),
      userId: 1, // Admin
      eventId: 2,
    },

    // Tomorrowland wallets
    {
      id: 9,
      value: 150,
      active: true,
      createdAt: new Date('2025-07-17T08:00:00'),
      userId: 7, // Jan Janssen
      eventId: 3,
    },
    {
      id: 10,
      value: 200,
      active: true,
      createdAt: new Date('2025-07-17T08:30:00'),
      userId: 8, // Jasper Jaspers
      eventId: 3,
    },
    {
      id: 11,
      value: 90,
      active: true,
      createdAt: new Date('2025-07-17T09:00:00'),
      userId: 9, // Piet Pieters
      eventId: 3,
    },
    {
      id: 12,
      value: 175,
      active: true,
      createdAt: new Date('2025-07-17T09:30:00'),
      userId: 1, // Admin
      eventId: 3,
    },
  ]);
  console.log('✅ Wallets seeded successfully\n');
}

async function seedTransactions() {
  console.log('💸 Seeding transactions...');
  await db.insert(schema.transactions).values([
    // Pukkelpop transactions - Day 1 (15 Aug)
    {
      id: 1,
      date: new Date('2025-08-15T12:00:00'),
      amount: -8,
      walletId: 1, // Jan bij Pintje
      vendorId: 2,
    },
    {
      id: 2,
      date: new Date('2025-08-15T12:15:00'),
      amount: -12,
      walletId: 2, // Jasper bij Frituurke
      vendorId: 3,
    },
    {
      id: 3,
      date: new Date('2025-08-15T12:30:00'),
      amount: -15,
      walletId: 3, // Piet bij Pizza Mario
      vendorId: 4,
    },
    {
      id: 4,
      date: new Date('2025-08-15T13:00:00'),
      amount: -6,
      walletId: 1, // Jan weer bij Pintje
      vendorId: 2,
    },
    {
      id: 5,
      date: new Date('2025-08-15T13:30:00'),
      amount: -10,
      walletId: 2, // Jasper bij Pintje
      vendorId: 2,
    },
    {
      id: 6,
      date: new Date('2025-08-15T14:00:00'),
      amount: -8,
      walletId: 3, // Piet bij Frituurke
      vendorId: 3,
    },
    {
      id: 7,
      date: new Date('2025-08-15T14:30:00'),
      amount: -5,
      walletId: 4, // Admin bij Pintje
      vendorId: 2,
    },
    {
      id: 8,
      date: new Date('2025-08-15T15:00:00'),
      amount: -14,
      walletId: 1, // Jan bij Pizza Mario
      vendorId: 4,
    },

    // Pukkelpop - Day 2 (16 Aug)
    {
      id: 9,
      date: new Date('2025-08-16T12:00:00'),
      amount: -7,
      walletId: 2, // Jasper bij Pintje
      vendorId: 2,
    },
    {
      id: 10,
      date: new Date('2025-08-16T12:30:00'),
      amount: -11,
      walletId: 3, // Piet bij Frituurke
      vendorId: 3,
    },

    {
      id: 12,
      date: new Date('2025-08-16T13:30:00'),
      amount: -16,
      walletId: 1, // Jan bij Pizza Mario
      vendorId: 4,
    },
    {
      id: 13,
      date: new Date('2025-08-16T14:00:00'),
      amount: -8,
      walletId: 4, // Admin bij Frituurke
      vendorId: 3,
    },

    // Rock Werchter transactions (3-6 July)
    {
      id: 14,
      date: new Date('2025-07-03T13:00:00'),
      amount: -10,
      walletId: 5, // Jan bij Pintje
      vendorId: 2,
    },
    {
      id: 15,
      date: new Date('2025-07-03T13:30:00'),
      amount: -13,
      walletId: 6, // Jasper bij Frituurke
      vendorId: 3,
    },
    {
      id: 16,
      date: new Date('2025-07-03T14:00:00'),
      amount: -15,
      walletId: 7, // Piet bij Pizza Mario
      vendorId: 4,
    },
    {
      id: 17,
      date: new Date('2025-07-04T12:00:00'),
      amount: -8,
      walletId: 5, // Jan bij Frituurke
      vendorId: 3,
    },
    {
      id: 18,
      date: new Date('2025-07-04T12:30:00'),
      amount: -12,
      walletId: 6, // Jasper bij Pizza Mario
      vendorId: 4,
    },
    {
      id: 19,
      date: new Date('2025-07-04T13:00:00'),
      amount: -7,
      walletId: 7, // Piet bij Pintje
      vendorId: 2,
    },
    {
      id: 20,
      date: new Date('2025-07-05T14:00:00'),
      amount: -9,
      walletId: 5, // Jan bij Pintje
      vendorId: 2,
    },
    {
      id: 21,
      date: new Date('2025-07-05T14:30:00'),
      amount: -14,
      walletId: 6, // Jasper bij Frituurke
      vendorId: 3,
    },

    // Tomorrowland transactions (18-27 July)
    {
      id: 22,
      date: new Date('2025-07-18T15:00:00'),
      amount: -12,
      walletId: 9, // Jan bij Pintje
      vendorId: 2,
    },
    {
      id: 23,
      date: new Date('2025-07-18T15:30:00'),
      amount: -18,
      walletId: 10, // Jasper bij Pizza Mario
      vendorId: 4,
    },
    {
      id: 24,
      date: new Date('2025-07-18T16:00:00'),
      amount: -10,
      walletId: 11, // Piet bij Frituurke
      vendorId: 3,
    },
    {
      id: 25,
      date: new Date('2025-07-18T16:30:00'),
      amount: -15,
      walletId: 12, // Admin bij Pizza Mario
      vendorId: 4,
    },
    {
      id: 26,
      date: new Date('2025-07-19T12:00:00'),
      amount: -11,
      walletId: 9, // Jan bij Frituurke
      vendorId: 3,
    },
    {
      id: 27,
      date: new Date('2025-07-19T12:30:00'),
      amount: -14,
      walletId: 10, // Jasper bij Pintje
      vendorId: 2,
    },
    {
      id: 28,
      date: new Date('2025-07-19T13:00:00'),
      amount: -16,
      walletId: 11, // Piet bij Pizza Mario
      vendorId: 4,
    },
    {
      id: 30,
      date: new Date('2025-07-20T14:00:00'),
      amount: -13,
      walletId: 9, // Jan bij Pizza Mario
      vendorId: 4,
    },
    {
      id: 31,
      date: new Date('2025-07-20T14:30:00'),
      amount: -8,
      walletId: 10, // Jasper bij Frituurke
      vendorId: 3,
    },
    {
      id: 32,
      date: new Date('2025-07-20T15:00:00'),
      amount: -10,
      walletId: 12, // Admin bij Pintje
      vendorId: 2,
    },
    {
      id: 33,
      date: new Date('2025-07-21T12:00:00'),
      amount: -17,
      walletId: 11, // Piet bij Pizza Mario
      vendorId: 4,
    },
    {
      id: 34,
      date: new Date('2025-07-21T12:30:00'),
      amount: -12,
      walletId: 9, // Jan bij Frituurke
      vendorId: 3,
    },
    {
      id: 35,
      date: new Date('2025-07-21T13:00:00'),
      amount: -7,
      walletId: 10, // Jasper bij Pintje
      vendorId: 2,
    },
    {
      id: 36,
      date: new Date('2025-08-16T16:00:00'),
      amount: -20,
      walletId: 2, // Grote aankoop - Jasper bij Pizza Mario
      vendorId: 4,
    },
    {
      id: 37,
      date: new Date('2025-08-16T16:30:00'),
      amount: -5,
      walletId: 3, // Kleine aankoop - Piet bij Pintje
      vendorId: 2,
    },
    {
      id: 38,
      date: new Date('2025-08-17T12:00:00'),
      amount: -11,
      walletId: 1, // Jan bij Frituurke
      vendorId: 3,
    },
    {
      id: 40,
      date: new Date('2025-08-17T13:00:00'),
      amount: -6,
      walletId: 4, // Admin bij Pintje
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
