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

describe('Events', () => {
  let app: INestApplication<App>;
  let drizzle: DatabaseProvider;

  let adminAuthToken: string;
  let organiserAuthToken: string;
  let customerAuthToken: string;

  const url = '/api/events';

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
  describe('GET /api/events', () => {
    //NON-ORGANISER
    it('should return 403 for non-organiser user', async () => {
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
    it('should 200 and return all events', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .auth(adminAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBe(3);

      expect(response.body.items).toEqual(
        expect.arrayContaining([
          {
            endDate: '2025-08-17T00:00:00.000Z',
            id: 1,
            location: 'Kiewit',
            name: 'Pukkelpop',
            organiser: { organisation: 'EDM lights', userId: 6 },
            organiserId: 6,
            startDate: '2025-08-15T00:00:00.000Z',
          },
          {
            endDate: '2025-07-06T00:00:00.000Z',
            id: 2,
            location: 'Werchter',
            name: 'Rock Werchter',
            organiser: { organisation: 'EDM lights', userId: 6 },
            organiserId: 6,
            startDate: '2025-07-03T00:00:00.000Z',
          },
          {
            endDate: '2025-08-06T00:00:00.000Z',
            id: 3,
            location: 'Boom',
            name: 'Tomorrow Land',
            organiser: { organisation: 'Coop-on', userId: 1 },
            organiserId: 1,
            startDate: '2025-08-03T00:00:00.000Z',
          },
        ]),
      );
    });
    testAuthHeader(() => request(app.getHttpServer()).get(url));
  });

  //getByID
  describe('GET /api/events/:id', () => {
    //ALL USERS
    it('should 200 and return event', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/1`)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        name: 'Pukkelpop',
        location: 'Kiewit',
        startDate: '2025-08-15T00:00:00.000Z',
        endDate: '2025-08-17T00:00:00.000Z',
        organiserId: 6,
        organiser: {
          organisation: 'EDM lights',
          userId: 6,
        },
      });
    });

    //ID bestaat niet
    it('should 404 when event does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/999999`)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No event with this id exists');
    });

    it('should 400 with invalid event id', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/invalid`)
        .auth(customerAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        'Validation failed (numeric string is expected)',
      );
    });

    testAuthHeader(() => request(app.getHttpServer()).get(`${url}/1`));
  });

  describe('POST /api/events', () => {
    //NON-ORGANISER
    it('should return 403 for non-organiser', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          name: 'New Festival',
          location: 'Ghent',
          startDate: new Date('2025-12-17'),
          endDate: new Date('2025-12-17'),
        })
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'You do not have access to this resource',
      );
    });

    //ORGANISER
    it('should 200 and return the created event for organiser', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          name: 'New Festival',
          location: 'Ghent',
          startDate: new Date('2025-12-17'),
          endDate: new Date('2025-12-17'),
        })
        .auth(organiserAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          organiserId: 6,
          name: 'New Festival',
          location: 'Ghent',
          startDate: '2025-12-17T00:00:00.000Z',
          endDate: '2025-12-17T00:00:00.000Z',
        }),
      );
    });

    //MISSING NAME
    it('should return 400 when missing name', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          location: 'Ghent',
          startDate: new Date('2025-12-17'),
          endDate: new Date('2025-12-17'),
        })
        .auth(organiserAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('name');
    });

    //MISSING LOCATION
    it('should return 400 when missing location', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          name: 'Event',
          startDate: new Date('2025-12-17'),
          endDate: new Date('2025-12-17'),
        })
        .auth(organiserAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('location');
    });

    //MISSING STARTDATE
    it('should return 400 when missing startdate', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          name: 'Event',
          location: 'Gent',
          endDate: new Date('2025-12-17'),
        })
        .auth(organiserAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('startDate');
    });

    //MISSING ENDDATE
    it('should return 400 when missing enddate', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          name: 'Event',
          location: 'Gent',
          startDate: new Date('2025-12-17'),
        })
        .auth(organiserAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('endDate');
    });

    //EXCISTING EVENT
    it('should 409 for duplicate event name', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          name: 'Pukkelpop',
          location: 'Ghent',
          startDate: new Date('2025-12-17'),
          endDate: new Date('2025-12-17'),
        })
        .auth(organiserAuthToken, { type: 'bearer' });

      expect(response.statusCode).toBe(409);
      expect(response.body).toMatchObject({
        message: 'An event with this name already exists',
      });
    });

    testAuthHeader(() => request(app.getHttpServer()).post(url));
  });

  //getWalletsByEventID
  describe('GET /api/events/:id/wallets', () => {
    //NON-ORGANISERS
    it('should return 403 for non-organisers', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/1/wallets`)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toEqual(
        'You do not have access to this resource',
      );
    });

    //EVENT OWNED BY ORGANISER
    it('should 200 and return wallets for organiser', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/2/wallets`)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);

      expect(response.body).toEqual(
        expect.arrayContaining([
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

    //EVENT NOT OWNED BY ORGANISER
    it("should 404 for organisers who don't own the event", async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/3/wallets`)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual('No event with this id found');
    });

    testAuthHeader(() => request(app.getHttpServer()).get(`${url}/3/wallets`));
  });

  //getTransactionsByEventId
  describe('GET /api/events/:id/transactions', () => {
    //NON-ORGANISER
    it('should return 403 for non-organisers', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/3/transactions`)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'You do not have access to this resource',
      );
    });

    //OWNER OF EVENT
    it('should 200 and return transactions', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/2/transactions`)
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(3);

      expect(response.body).toEqual(
        expect.arrayContaining([
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
            amount: -12,
            date: '2025-07-18T13:00:00.000Z',
            eventId: 2,
            id: 2,
            vendor: { boothName: 'Mario Pizza', userId: 10 },
            vendorId: 10,
            walletId: 2,
          },
        ]),
      );
    });

    //NON EXISTING EVENT
    it('should 404 for non-existent event', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/99999/transactions`)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual('No event with this id found');
    });
    //NON OWNER OF EVENT
    it("should 404 for organisers who don't own the event", async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/3/transactions`)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual('No event with this id found');
    });

    testAuthHeader(() =>
      request(app.getHttpServer()).get(`${url}/3/transactions`),
    );
  });

  //updateById
  describe('PUT /api/events/:id', () => {
    //NON-ORGANISER
    it('should return 403 for non-organiser', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/1`)
        .send({ name: 'Updated Festival Name' })
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toEqual(
        'You do not have access to this resource',
      );
    });

    //EVENT NOT OWNED BY ORGANISER
    it('should 404 when the event is not owned by the organiser', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/3`)
        .send({ name: 'Updated Name', location: 'Updated Location' })
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual('No event with this id found');
    });

    //EVENT OWNED BY ORGANISER
    it('should return 200 and update event for organising organiser', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/2`)
        .send({ name: 'Updated Name', location: 'Updated Location' })
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 2,
          name: 'Updated Name',
          location: 'Updated Location',
          startDate: '2025-07-03T00:00:00.000Z',
          endDate: '2025-07-06T00:00:00.000Z',
          organiserId: 6,
          organiser: {
            userId: 6,
            organisation: 'EDM lights',
          },
        }),
      );
    });

    //ADMIN
    it('should return 200 and update event', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/3`)
        .send({
          startDate: '2025-08-18T00:00:00.000Z',
          endDate: '2025-08-20T00:00:00.000Z',
        })
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 3,
          name: 'Tomorrow Land',
          location: 'Boom',
          startDate: '2025-08-18T00:00:00.000Z',
          endDate: '2025-08-20T00:00:00.000Z',
          organiserId: 1,
          organiser: {
            userId: 1,
            organisation: 'Coop-on',
          },
        }),
      );
    });

    //EMPTY CONTENT
    it('should 400 for empty update content', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/3`)
        .send({ name: '' })
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('name');
    });

    //DUPLICATE NAMES
    it('should 409 for duplicate event name', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/3`)
        .send({ name: 'Pukkelpop' })
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(409);
      expect(response.body.message).toEqual(
        'An event with this name already exists',
      );
    });

    //NON-EXISTING EVENT
    it('should 404 when updating a non-existent event', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/99999`)
        .send({ name: 'Event' })
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual('No event with this id found');
    });

    testAuthHeader(() =>
      request(app.getHttpServer()).put(`${url}/3`).send({
        name: 'Updated Name',
        location: 'Updated Location',
        startDate: '2025-08-18T00:00:00.000Z',
        endDate: '2025-08-20T00:00:00.000Z',
      }),
    );
  });

  //deleteEventById
  describe('DELETE /api/events/:id', () => {
    //NON-ORGANISER
    it('should return 403 for customer', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/1`)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toEqual(
        'You do not have access to this resource',
      );
    });

    //NON-OWNER
    it('should return 404 for organisers who do not own the event', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/3`)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual('No event with this id found');
    });

    it('should 404 when deleting a non-existent event as admin', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/99999`)
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual('No event with this id found');
    });

    //OWNER OF EVENT
    it('should 204 and return nothing', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/1`)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    //ADMIN
    it('should 204 and return nothing', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/2`)
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });
    testAuthHeader(() => request(app.getHttpServer()).delete(`${url}/3`));
  });
});
