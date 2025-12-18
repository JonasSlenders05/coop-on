import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './helpers/create-app';
import {
  DatabaseProvider,
  DrizzleAsyncProvider,
} from '../src/drizzle/drizzle.provider';
import { clearEvents, seedEvents } from './seed/events';
import { clearUsers, seedUsers } from './seed/users';
// Zorg dat loginVendor hier is toegevoegd
import { loginAdmin, loginCustomer, loginVendor } from './helpers/login';
import testAuthHeader from './helpers/testAuthHeader';
import { clearOrganisers, seedOrganisers } from './seed/organisers';
import { clearWallets, seedWallets } from './seed/wallets';
import { clearTransactions, seedTransactions } from './seed/transactions';
import { clearVendors, seedVendors } from './seed/vendors';

describe('Transactions', () => {
  let app: INestApplication<App>;
  let drizzle: DatabaseProvider;

  let adminAuthToken: string;
  let customerAuthToken: string;
  let vendorAuthToken: string; // Nieuwe token variabele

  const url = '/api/transactions';

  beforeAll(async () => {
    app = await createTestApp();
    drizzle = app.get(DrizzleAsyncProvider);

    await seedUsers(app, drizzle);
    await seedOrganisers(app, drizzle);
    await seedVendors(app, drizzle);
    await seedEvents(drizzle);
    await seedWallets(drizzle);
    await seedTransactions(drizzle);

    adminAuthToken = await loginAdmin(app);
    customerAuthToken = await loginCustomer(app);
    vendorAuthToken = await loginVendor(app);
  });

  afterAll(async () => {
    await clearTransactions(drizzle);
    await clearWallets(drizzle);
    await clearEvents(drizzle);
    await clearVendors(drizzle);
    await clearOrganisers(drizzle);
    await clearUsers(drizzle);
    await app.close();
  });

  // getAll
  describe('GET /api/transactions', () => {
    // GENERAL USER
    it('should return 403 for general user', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
    });

    it('should return 403 for vendor user', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .auth(vendorAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'You do not have access to this resource',
      );
    });

    // ADMIN
    it('should 200 and return all transactions for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBe(4);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          {
            amount: -8,
            date: '2025-08-15T10:00:00.000Z',
            eventId: 2,
            id: 1,
            vendor: { boothName: 'Mario Pizza', userId: 10 },
            vendorId: 10,
            walletId: 1,
          },
          {
            amount: -12,
            date: '2025-07-18T13:00:00.000Z',
            eventId: 2,
            id: 2,
            vendor: { boothName: 'Mario Pizza', userId: 10 },
            vendorId: 10,
            walletId: 2,
          },
          {
            amount: -8,
            date: '2025-08-15T10:00:00.000Z',
            eventId: 2,
            id: 3,
            vendor: { boothName: 'Mario Pizza', userId: 10 },
            vendorId: 10,
            walletId: 1,
          },
          {
            amount: -8,
            date: '2025-08-15T10:00:00.000Z',
            eventId: 1,
            id: 4,
            vendor: { boothName: 'Luigi Kebab', userId: 11 },
            vendorId: 11,
            walletId: 1,
          },
        ]),
      );
    });

    testAuthHeader(() => request(app.getHttpServer()).get(url));
  });

  // getById
  describe('GET /api/transactions/:id', () => {
    // OWNER (CUSTOMER)
    it('should 200 and return transaction for wallet owner', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/2`)
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 2,
        date: '2025-07-18T13:00:00.000Z',
        amount: -12,
        walletId: 2,
        vendorId: 10,
        eventId: 2,
      });
    });

    //OWNER (VENDOR)
    it('should 200 and return transaction for owning vendor', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/3`)
        .auth(vendorAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 3,
        date: '2025-08-15T10:00:00.000Z',
        amount: -8,
        walletId: 1,
        vendorId: 10,
        eventId: 2,
      });
    });

    //NON VENDOR TRANSACTION
    it("should 404 for not vendor's transaction", async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/4`)
        .auth(vendorAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual(
        'No transaction with this id found',
      );
    });

    //NON USER TRANSACTION
    it("should 404 for not user's transaction", async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/1`)
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual(
        'No transaction with this id found',
      );
    });

    // ADMIN
    it('should 200 and return transaction for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/3`)
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 3,
        date: '2025-08-15T10:00:00.000Z',
        amount: -8,
        walletId: 1,
        vendorId: 10,
        eventId: 2,
      });
    });

    // ID BESTAAT NIET
    it('should 404 when transaction does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/999999`)
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
    });

    testAuthHeader(() => request(app.getHttpServer()).get(`${url}/1`));
  });

  // Create
  describe('POST /api/transactions', () => {
    // CUSTOMER
    it('should 201 and return created transaction for customer', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          amount: -5,
          walletId: 2,
          vendorId: 10,
        })
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        amount: -5,
        walletId: 2,
        vendorId: 10,
      });
    });

    //NOT USERS WALLET
    it("should 404 for not user's wallet", async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          amount: -5,
          walletId: 1,
          vendorId: 10,
        })
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual('No wallet with this id found');
    });

    //NON EXISTING WALLET
    it('should 404 for not existent wallet', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          amount: -5,
          walletId: 99999,
          vendorId: 10,
        })
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual('No wallet with this id found');
    });

    //NON EXISTING VENDOR
    it('should 404 for not existent wallet', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          amount: -5,
          walletId: 2,
          vendorId: 99999,
        })
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual(
        'Vendor with this id does not exist',
      );
    });

    testAuthHeader(() => request(app.getHttpServer()).post(url));
  });

  // UpdateById
  describe('PUT /api/transactions/:id', () => {
    // NON-ADMIN
    it('should return 403 for no access users', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/1`)
        .send({ amount: -50 })
        .auth(vendorAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toEqual(
        'You do not have access to this resource',
      );
    });

    // ADMIN
    it('should return 200 and update transaction for admin', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/1`)
        .send({ amount: -99 })
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.amount).toBe(-99);
    });

    testAuthHeader(() =>
      request(app.getHttpServer()).put(`${url}/1`).send({ amount: -10 }),
    );
  });

  // DeleteById
  describe('DELETE /api/transactions/:id', () => {
    // VENDOR (NIEUW)
    it('should return 403 for vendor', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/1`)
        .auth(vendorAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
    });

    // ADMIN
    it('should 204 and return nothing', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/1`)
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(204);
    });

    testAuthHeader(() => request(app.getHttpServer()).delete(`${url}/3`));
  });
});
