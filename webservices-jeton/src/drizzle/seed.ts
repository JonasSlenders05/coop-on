import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema';
import * as argon2 from 'argon2';
import { PrivateRole, PublicRole } from '../auth/roles';

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
      privateRoles: [PrivateRole.ADMIN],
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
      firstname: 'Frank',
      lastname: 'Vandenbroeke',
      email: 'frank@pukkelpop.be',
      phonenumber: '+32484750987',
      passwordHash: await hashPassword('12345678'),
      publicRoles: [PublicRole.ORGANISER],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 4,
      firstname: 'Dimitri',
      lastname: 'Miami',
      email: 'dimitri@tomorrowland.be',
      phonenumber: '+32484750988',
      passwordHash: await hashPassword('12345678'),
      publicRoles: [PublicRole.ORGANISER],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 5,
      firstname: 'Jan',
      lastname: 'Janssen',
      email: 'janjanssen@gmail.com',
      phonenumber: '+32484750989',
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
    { userId: 1, organisation: 'coop-on' },
    { userId: 3, organisation: 'Pop Events' },
    { userId: 4, organisation: 'EDM Lights' },
  ]);
  console.log('✅ Organisers seeded successfully\n');
}

async function seedVendors() {
  console.log('🏪 Seeding vendors...');
  await db
    .insert(schema.vendors)
    .values([{ userId: 2, boothName: 'Bierbar Pintje' }]);
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
      organiserId: 3, // Frank
    },
    {
      id: 2,
      name: 'Tomorrowland',
      location: 'Boom',
      startDate: new Date('2025-07-18'),
      endDate: new Date('2025-07-27'),
      organiserId: 4, // Dimitri
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
      active: true,
      createdAt: new Date('2025-08-14T10:00:00'),
      userId: 5, // Jan (customer)
      eventId: 1, // Pukkelpop
    },
    {
      id: 2,
      value: 100,
      active: true,
      createdAt: new Date('2025-07-17T10:00:00'),
      userId: 5, // Jan (customer)
      eventId: 2, // Tomorrowland
    },
  ]);
  console.log('✅ Wallets seeded successfully\n');
}

async function seedTransactions() {
  console.log('💸 Seeding transactions...');
  await db.insert(schema.transactions).values([
    {
      id: 1,
      date: new Date('2025-08-15T12:00:00'),
      amount: -8,
      walletId: 1, // Jan
      vendorId: 2, // Pieter (Pintje)
      eventId: 1, // bij Pukkelpop
    },
    {
      id: 2,
      date: new Date('2025-07-18T15:00:00'),
      amount: -12,
      walletId: 2, // Jan
      vendorId: 2, // Pieter (Pintje)
      eventId: 2, // bij Tomorrowland
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
