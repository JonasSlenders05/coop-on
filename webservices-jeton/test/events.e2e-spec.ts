import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './helpers/create-app';
import {
  DatabaseProvider,
  DrizzleAsyncProvider,
} from '../src/drizzle/drizzle.provider';
import { clearEvents, EVENTS_SEED, seedEvents } from './seed/event';
import { clearUsers, seedUsers } from './seed/users';
import { loginAdmin, loginCustomer, loginOrganiser } from './helpers/login';
import testAuthHeader from './helpers/testAuthHeader';
import { clearOrganisers, seedOrganisers } from './seed/organisers';
import {
  CreateEventRequestDto,
  UpdateEventRequestDto,
} from '../src/event/event.dto';

describe('Events', () => {
  let app: INestApplication<App>;
  let drizzle: DatabaseProvider;

  let adminAuthToken: string;
  let organiserAuthToken: string;
  let customerAuthToken: string;
  let eventID: number;

  const url = '/api/events';

  beforeAll(async () => {
    app = await createTestApp();
    drizzle = app.get(DrizzleAsyncProvider);

    await seedUsers(app, drizzle);
    await seedOrganisers(app, drizzle);
    await seedEvents(drizzle);

    organiserAuthToken = await loginOrganiser(app);
    adminAuthToken = await loginAdmin(app);
    customerAuthToken = await loginCustomer(app);

    eventID = EVENTS_SEED[0].id;
  });

  afterAll(async () => {
    await clearEvents(drizzle);
    await clearOrganisers(drizzle);
    await clearUsers(drizzle);
    await app.close();
  });

  describe('GET /api/events', () => {
    it('should return 403 for non-organiser user', async () => {
      await request(app.getHttpServer())
        .get(url)
        .auth(customerAuthToken, { type: 'bearer' })
        .expect(403);
    });

    it('should return 403 for organiser user', async () => {
      await request(app.getHttpServer())
        .get(url)
        .auth(organiserAuthToken, { type: 'bearer' })
        .expect(403);
    });

    it('should 200 and return all events', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .auth(adminAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body.items).toEqual(expect.arrayContaining(EVENTS_SEED));
    });
    testAuthHeader(() => request(app.getHttpServer()).get(url));
  });

  describe('GET /api/events/:id', () => {
    it('should 200 and return event', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/${eventID}`)
        .auth(customerAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(eventID);
    });

    it('should 404 when event does not exist', async () => {
      await request(app.getHttpServer())
        .get(`${url}/999999`)
        .auth(customerAuthToken, { type: 'bearer' })
        .expect(404);
    });
    testAuthHeader(() => request(app.getHttpServer()).get(`${url}/${eventID}`));
  });

  describe('POST /api/events', () => {
    const newEvent: CreateEventRequestDto = {
      name: 'New Festival',
      location: 'Ghent',
      startDate: new Date(),
      endDate: new Date(),
    };

    it('should return 403 for customer', async () => {
      await request(app.getHttpServer())
        .post(url)
        .send(newEvent)
        .auth(customerAuthToken, { type: 'bearer' })
        .expect(403);
    });

    it('should 201 and create event for organiser', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send(newEvent)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe(newEvent.name);
    });

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post(url)
        .send({ ...newEvent, name: '' })
        .auth(organiserAuthToken, { type: 'bearer' })
        .expect(400);
    });
    testAuthHeader(() => request(app.getHttpServer()).post(url));
  });

  describe('PUT /api/events/:id', () => {
    const updateData: UpdateEventRequestDto = {
      name: 'Updated Festival Name',
    };

    it('should return 403 for customer', async () => {
      await request(app.getHttpServer())
        .put(`${url}/${eventID}`)
        .send(updateData)
        .auth(customerAuthToken, { type: 'bearer' })
        .expect(403);
    });

    it('should 200 and update event for organiser', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/${eventID}`)
        .send(updateData)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe(updateData.name);
    });
    testAuthHeader(() => request(app.getHttpServer()).put(`${url}/${eventID}`));
  });

  describe('GET /api/events/:id/wallets', () => {
    it('should return 403 for customer', async () => {
      await request(app.getHttpServer())
        .get(`${url}/${eventID}/wallets`)
        .auth(customerAuthToken, { type: 'bearer' })
        .expect(403);
    });

    it('should 200 and return wallets for organiser', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/${eventID}/wallets`)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    testAuthHeader(() =>
      request(app.getHttpServer()).get(`${url}/${eventID}/wallets`),
    );
  });

  describe('GET /api/events/:id/transactions', () => {
    it('should return 403 for customer', async () => {
      await request(app.getHttpServer())
        .get(`${url}/${eventID}/transactions`)
        .auth(customerAuthToken, { type: 'bearer' })
        .expect(403);
    });

    it('should 200 and return transactions for organiser', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/${eventID}/transactions`)
        .auth(organiserAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    testAuthHeader(() =>
      request(app.getHttpServer()).get(`${url}/${eventID}/transactions`),
    );
  });

  describe('DELETE /api/events/:id', () => {
    it('should return 403 for customer', async () => {
      await request(app.getHttpServer())
        .delete(`${url}/${eventID}`)
        .auth(customerAuthToken, { type: 'bearer' })
        .expect(403);
    });

    it('should 204 and delete event for organiser', async () => {
      await request(app.getHttpServer())
        .delete(`${url}/${eventID}`)
        .auth(organiserAuthToken, { type: 'bearer' })
        .expect(204);

      await request(app.getHttpServer())
        .get(`${url}/${eventID}`)
        .auth(adminAuthToken, { type: 'bearer' })
        .expect(404);
    });
    testAuthHeader(() =>
      request(app.getHttpServer()).delete(`${url}/${eventID}`),
    );
  });
});
