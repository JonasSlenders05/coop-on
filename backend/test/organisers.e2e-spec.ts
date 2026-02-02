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
import { loginAdmin, loginCustomer, loginOrganiser } from './helpers/login';
import testAuthHeader from './helpers/testAuthHeader';
import { clearOrganisers, seedOrganisers } from './seed/organisers';
import { clearWallets, seedWallets } from './seed/wallets';
import { clearTransactions, seedTransactions } from './seed/transactions';
import { clearVendors, seedVendors } from './seed/vendors';

describe('Organisers', () => {
  let app: INestApplication<App>;
  let drizzle: DatabaseProvider;

  let adminAuthToken: string;
  let organiserAuthToken: string;
  let customerAuthToken: string;

  const url = '/api/organisers';

  beforeAll(async () => {
    app = await createTestApp();
    drizzle = app.get(DrizzleAsyncProvider);

    await seedUsers(app, drizzle);
    await seedOrganisers(app, drizzle);
    await seedVendors(app, drizzle);
    await seedEvents(drizzle);
    await seedWallets(drizzle);
    await seedTransactions(drizzle);

    organiserAuthToken = await loginOrganiser(app);
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

  //getAll
  describe('GET /api/organisers', () => {
    //NON-ORGANISER
    it('should return 403 for non-organiser', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'You do not have access to this resource',
      );
    });

    //ORGANISER
    it('should return 403 for organiser user', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'You do not have access to this resource',
      );
    });

    //ADMIN
    it('should 200 and return all organisers', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBe(2);

      expect(response.body.items).toEqual(expect.arrayContaining([]));
    });
    testAuthHeader(() => request(app.getHttpServer()).get(url));
  });

  //getByID
  describe('GET /api/organisers/:id', () => {
    //CUSTOMER
    it('should return 403 for customer', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/6`)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'You do not have access to this resource',
      );
    });

    //ORGANISER (OWN ID)
    it('should 200 and return own profile', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/me`)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        userId: 6,
        organisation: 'EDM lights',
      });
    });

    //ORGANISER (OTHER ID)
    it('should 404 when organiser tries to view other organiser', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/1`)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No organiser with this id exists');
    });

    //ADMIN
    it('should 200 and return any organiser', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/1`)
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        userId: 1,
        organisation: 'Coop-on',
      });
    });

    //ID BESTAAT NIET
    it('should 404 when organiser does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/999999`)
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No organiser with this id exists');
    });

    it('should 400 with invalid organiser id', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/invalid`)
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('User ID must be a number or "me"');
    });

    testAuthHeader(() => request(app.getHttpServer()).get(`${url}/me`));
  });

  //updateById
  describe('PUT /api/organisers/:id', () => {
    //CUSTOMER
    it('should return 403 for customer', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/6}`)
        .send({ organisation: 'Hacked Name' })
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'You do not have access to this resource',
      );
    });

    //ORGANISER (OWN ID)
    it('should 200 and update own profile', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/me`)
        .send({ organisation: 'My New Organisation' })
        .auth(organiserAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          userId: 6,
          organisation: 'My New Organisation',
        }),
      );
    });

    //ORGANISER (OTHER ID)
    it('should 404 when organiser tries to update other organiser', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/1`)
        .send({ organisation: 'Malicious Update' })
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No organiser with this id exists');
    });

    //ADMIN
    it('should 200 and update any organiser', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/1`)
        .send({ organisation: 'Admin Updated' })
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        userId: 1,
        organisation: 'Admin Updated',
      });
    });

    //VALIDATION (TOO SHORT)
    it('should 400 when organisation name is too short', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/me`)
        .send({ organisation: 'A' })
        .auth(organiserAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('organisation');
    });

    //NOT FOUND
    it('should 404 when updating non-existent organiser', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/999999`)
        .send({ organisation: 'Ghost' })
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No organiser with this id exists');
    });

    testAuthHeader(() =>
      request(app.getHttpServer())
        .put(`${url}/me`)
        .send({ organisation: 'Test' }),
    );
  });

  //getEventsByOrganiserId
  describe('GET /api/organisers/:id/events', () => {
    //CUSTOMER
    it('should return 403 for customer', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/6}/events`)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'You do not have access to this resource',
      );
    });

    //ORGANISER (OWN ID)
    it('should 200 and return own events', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/me/events`)
        .auth(organiserAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(2);

      expect(response.body).toEqual(
        expect.arrayContaining([
          {
            endDate: '2025-08-17T00:00:00.000Z',
            id: 1,
            location: 'Kiewit',
            name: 'Pukkelpop',
            organiser: { organisation: 'Ghost', userId: 6 },
            organiserId: 6,
            startDate: '2025-08-15T00:00:00.000Z',
          },
          {
            endDate: '2025-07-06T00:00:00.000Z',
            id: 2,
            location: 'Werchter',
            name: 'Rock Werchter',
            organiser: { organisation: 'Ghost', userId: 6 },
            organiserId: 6,
            startDate: '2025-07-03T00:00:00.000Z',
          },
        ]),
      );
    });

    //ORGANISER (OTHER ID)
    it('should 404 when organiser tries to view events of other organiser', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/1/events`)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No organiser with this id exists');
    });

    //ADMIN
    it('should 200 and return events of any organiser', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/1/events`)
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);

      expect(response.body).toEqual(
        expect.arrayContaining([
          {
            endDate: '2025-08-06T00:00:00.000Z',
            id: 3,
            location: 'Boom',
            name: 'Tomorrow Land',
            organiser: { organisation: 'Ghost', userId: 1 },
            organiserId: 1,
            startDate: '2025-08-03T00:00:00.000Z',
          },
        ]),
      );
    });

    testAuthHeader(() => request(app.getHttpServer()).get(`${url}/me/events`));
  });
});
