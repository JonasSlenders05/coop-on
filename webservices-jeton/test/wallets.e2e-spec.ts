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
import { loginAdmin, loginCustomer } from './helpers/login';
import testAuthHeader from './helpers/testAuthHeader';
import { clearOrganisers, seedOrganisers } from './seed/organisers';
import { clearWallets, seedWallets } from './seed/wallets';
import { clearTransactions, seedTransactions } from './seed/transactions';
import { clearVendors, seedVendors } from './seed/vendors';

describe('Wallets', () => {
  let app: INestApplication<App>;
  let drizzle: DatabaseProvider;

  let adminAuthToken: string;
  let customerAuthToken: string; // User ID 5 (Owns Wallet 2 & 3)

  const url = '/api/wallets';

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
  describe('GET /api/wallets', () => {
    // NO ACCESS USERS
    it('should return 403 for no access users', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'You do not have access to this resource',
      );
    });

    // ADMIN
    it('should 200 and return all wallets for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBeGreaterThanOrEqual(3);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          {
            active: true,
            createdAt: '2025-08-14T08:00:00.000Z',
            event: { name: 'Tomorrow Land' },
            eventId: 3,
            id: 1,
            user: { email: 'dimitri@tommorowland.be' },
            userId: 6,
            value: 50,
          },
          {
            active: true,
            createdAt: '2025-07-17T08:00:00.000Z',
            event: { name: 'Tomorrow Land' },
            eventId: 3,
            id: 2,
            user: { email: 'frank.dewever@gmail.com' },
            userId: 5,
            value: 100,
          },
          {
            active: true,
            createdAt: '2025-08-14T08:00:00.000Z',
            event: { name: 'Rock Werchter' },
            eventId: 2,
            id: 3,
            user: { email: 'frank.dewever@gmail.com' },
            userId: 5,
            value: 50,
          },
        ]),
      );
    });

    testAuthHeader(() => request(app.getHttpServer()).get(url));
  });

  // getById
  describe('GET /api/wallets/:id', () => {
    // OWN WALLET
    it('should 200 and return own wallet', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/2`)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 2,
        value: 100,
        userId: 5,
      });
    });

    // NOT OWNER
    it("should 404 for not user's own wallet", async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/1`)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No wallet with this id found');
    });

    // ADMIN
    it('should 200 and return any wallet', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/1`)
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        userId: 6,
        value: 50,
      });
    });

    // ID BESTAAT NIET
    it('should 404 when wallet does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/999999`)
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No wallet with this id found');
    });

    it('should 400 with invalid wallet id', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/invalid`)
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toEqual(
        'Validation failed (numeric string is expected)',
      );
    });

    testAuthHeader(() => request(app.getHttpServer()).get(`${url}/2`));
  });

  // createWallet
  describe('POST /api/wallets', () => {
    // CUSTOMER
    it('should 201 and create wallet for self', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ eventId: 1, value: 20, active: true })
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        value: 20,
        active: true,
        eventId: 1,
        userId: 5,
      });
    });

    it('should 409 when user already has a wallet for this event', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ eventId: 3, value: 20, active: true })
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(409);
    });

    // NO EVENT
    it('should 400 when creating wallet without eventId', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ value: 100, active: true })
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('eventId');
    });

    testAuthHeader(() =>
      request(app.getHttpServer())
        .post(url)
        .send({ eventId: 1, value: 0, active: true }),
    );
  });

  // updateWallet
  describe('PUT /api/wallets/:id', () => {
    // CUSTOMER'S OWN WALLET
    it('should 200 and update own wallet', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/2`)
        .send({ value: 150 })
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 2,
          value: 150,
          userId: 5,
        }),
      );
    });

    // NOT OWNER
    it('should 404 when user tries to update other wallet', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/1`)
        .send({ value: 999 })
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No wallet with this id found');
    });

    // ADMIN
    it('should 200 and update any wallet', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/1`)
        .send({ value: 500 })
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        value: 500,
        userId: 6,
      });
    });

    // NOT FOUND
    it('should 404 when updating non-existent wallet', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/999999`)
        .send({ value: 10 })
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No wallet with this id found');
    });

    testAuthHeader(() =>
      request(app.getHttpServer()).put(`${url}/2`).send({ value: 10 }),
    );
  });

  // getTransactionsByWalletId
  describe('GET /api/wallets/:id/transactions', () => {
    // CUSTOMER (OWN ID)
    it('should 200 and return transactions for own wallet', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/2/transactions`)
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    // CUSTOMER (OTHER ID)
    it('should 404 when user tries to view transactions of other wallet', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/1/transactions`)
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).not.toBe(200);
    });

    // ADMIN
    it('should 200 and return transactions of any wallet', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/1/transactions`)
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    testAuthHeader(() =>
      request(app.getHttpServer()).get(`${url}/2/transactions`),
    );
  });

  // deleteWallet
  describe('DELETE /api/wallets/:id', () => {
    // CUSTOMER (OTHER ID)
    it('should 404 when user tries to delete other wallet', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/1`)
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(404);
    });

    // ADMIN
    it('should 204 and delete any wallet', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/3`)
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(204);
      expect(response.body).toMatchObject({});
    });

    testAuthHeader(() => request(app.getHttpServer()).delete(`${url}/1`));
  });
});
