import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './helpers/create-app';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/health/ping', () => {
    it('should return pong', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/health/ping',
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ pong: true });
    });
  });
});
