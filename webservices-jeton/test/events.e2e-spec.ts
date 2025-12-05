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
import { login, loginAdmin } from './helpers/login';
import testAuthHeader from './helpers/testAuthHeader';
import { clearOrganisers, seedOrganisers } from './seed/organisers';

describe('Events', () => {
  let app: INestApplication<App>;
  let drizzle: DatabaseProvider;

  let userAuthToken: string;
  let adminAuthToken: string;

  const url = 'api/events';

  beforeAll(async () => {
    app = await createTestApp();
    drizzle = app.get(DrizzleAsyncProvider);

    await seedUsers(app, drizzle);
    await seedOrganisers(app, drizzle);
    await seedEvents(drizzle);

    userAuthToken = await login(app);
    adminAuthToken = await loginAdmin(app);
  });

  afterAll(async () => {
    await clearEvents(drizzle);
    await clearOrganisers(drizzle);
    await clearUsers(drizzle);
    await app.close();
  });

  describe('GET /api/events', () => {
    it('should 200 and return all events', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .auth(userAuthToken, { type: 'bearer' });
      expect(response.statusCode).toBe(200);
      expect(response.body.items).toEqual(expect.arrayContaining(EVENTS_SEED));
    });
    testAuthHeader(() => request(app.getHttpServer()).get(url));
  });
});
