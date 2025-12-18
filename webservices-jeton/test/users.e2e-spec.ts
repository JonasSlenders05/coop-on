import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  DatabaseProvider,
  DrizzleAsyncProvider,
} from '../src/drizzle/drizzle.provider';
import { createTestApp } from './helpers/create-app';
import { loginAdmin, loginCustomer } from './helpers/login';
import { seedEvents, clearEvents } from './seed/events';
import { seedOrganisers, clearOrganisers } from './seed/organisers';
import { clearTransactions, seedTransactions } from './seed/transactions';
import { seedVendors, clearVendors } from './seed/vendors';
import { seedWallets, clearWallets } from './seed/wallets';
import { seedUsers, clearUsers } from './seed/users';
import { PublicRole } from '../src/auth/roles';
import { randomBytes } from 'crypto';
import testAuthHeader from './helpers/testAuthHeader';
import { eq } from 'drizzle-orm';
import { AuthService } from '../src/auth/auth.service';
import { users } from '../src/drizzle/schema';

describe('Users', () => {
  let app: INestApplication;
  let drizzle: DatabaseProvider;

  let adminAuthToken: string;
  let userAuthToken: string;

  const url = '/api/users';

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
    userAuthToken = await loginCustomer(app);
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

  describe('GET /api/users', () => {
    it('should 200 and return all users', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBe(4);

      expect(response.body.items).toEqual(
        expect.arrayContaining([
          {
            id: 6,
            firstname: 'Dimitri',
            lastname: 'Miami',
            email: 'dimitri@tommorowland.be',
            phonenumber: '+32484750987',
            publicRoles: [PublicRole.ORGANISER],
          },
          {
            id: 10,
            firstname: 'Mario',
            lastname: 'Pizza',
            email: 'mario@pizza.be',
            phonenumber: '+32484750987',
            publicRoles: [PublicRole.VENDOR],
          },
          {
            id: 5,
            firstname: 'Frank',
            lastname: 'De Wever',
            email: 'frank.dewever@gmail.com',
            phonenumber: '+32484750987',
            publicRoles: [PublicRole.CUSTOMER],
          },
          {
            id: 1,
            firstname: 'Admin',
            lastname: 'User',
            email: 'admin@coop-on.be',
            phonenumber: '+32484750987',
            publicRoles: [
              PublicRole.CUSTOMER,
              PublicRole.ORGANISER,
              PublicRole.VENDOR,
            ],
          },
        ]),
      );
    });

    testAuthHeader(() => request(app.getHttpServer()).get(url));
  });

  describe('POST /api/users', () => {
    //REGISTER ORGANISER
    it('should 201 and return the token for the registered organiser', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          firstname: 'Test',
          lastname: 'Organiser',
          email: 'test.organiser@coop-on.be',
          phonenumber: '+32484750987',
          password: '12345678',
          publicRoles: [PublicRole.ORGANISER],
          organisation: 'Test Organisation',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.token).toBeTruthy();
    });

    //REGISTER CUSTOMER
    it('should 201 and return the token for the registered customer', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          firstname: 'Test',
          lastname: 'Customer',
          email: 'test.customer@coop-on.be',
          phonenumber: '+32484750987',
          password: '12345678',
          publicRoles: [PublicRole.CUSTOMER],
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.token).toBeTruthy();
    });

    //REGISTER VENDOR
    it('should 201 and return the token for the registered vendor', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          firstname: 'Test',
          lastname: 'Vendor',
          email: 'test.vendor@coop-on.be',
          phonenumber: '+32484750987',
          password: '12345678',
          publicRoles: [PublicRole.VENDOR],
          boothName: 'Testbooth',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.token).toBeTruthy();
    });

    it('should 409 when using duplicate email', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          firstname: 'Test',
          lastname: 'Vendor',
          email: 'test.vendor@coop-on.be',
          phonenumber: '+32484750987',
          password: '12345678',
          publicRoles: [PublicRole.VENDOR],
          boothName: 'Testbooth',
        });

      expect(response.statusCode).toBe(409);

      expect(response.body.message).toEqual(
        'There is already a user with this email address',
      );
    });

    //MISSING EMAIL USER
    it('should 400 when missing email', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          firstname: 'Test',
          lastname: 'User',
          phonenumber: '+32484750987',
          password: '12345678',
          publicRoles: [PublicRole.CUSTOMER],
        });

      expect(response.statusCode).toBe(400);

      expect(response.body.details.body).toHaveProperty('email');
    });

    //MISSING PASSWORD USER
    it('should 400 when missing passsword', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test.user@coop-on.be',
          phonenumber: '+32484750987',
          publicRoles: [PublicRole.CUSTOMER],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('password');
    });

    //MISSING FIRSTNAME USER
    it('should 400 when missing firstname', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          lastname: 'User',
          email: 'test.user@coop-on.be',
          phonenumber: '+32484750987',
          password: '12345678',
          publicRoles: [PublicRole.CUSTOMER],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('firstname');
    });

    //MISSING LASTNAME USER
    it('should 400 when missing lastname', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          firstname: 'User',
          email: 'test.user@coop-on.be',
          phonenumber: '+32484750987',
          password: '12345678',
          publicRoles: [PublicRole.CUSTOMER],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('lastname');
    });

    //MISSING PUBLICROLE USER
    it('should 400 when missing publicroles', async () => {
      const response = await request(app.getHttpServer()).post(url).send({
        firstname: 'Test',
        lastname: 'User',
        email: 'test.user@coop-on.be',
        phonenumber: '+32484750987',
        password: '12345678',
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('publicRoles');
    });

    //MISSING PHONENUMBER USER
    it('should 400 when missing phonenumber', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test.user@coop-on.be',
          password: '12345678',
          publicRoles: [PublicRole.CUSTOMER],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('phonenumber');
    });

    //PASSWORD TO SHORT
    it('should 400 when passsword too short', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test.user@coop-on.be',
          phonenumber: '+32484750987',
          publicRoles: [PublicRole.CUSTOMER],
          password: 'short',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('password');
    });

    //PASSWORD TOO LONG
    it('should 400 when password too long', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test.user@coop-on.be',
          phonenumber: '+32484750987',
          publicRoles: [PublicRole.CUSTOMER],
          password: randomBytes(65).toString('hex'),
        });

      expect(response.statusCode).toBe(400);

      expect(response.body.details.body).toHaveProperty('password');
    });
  });

  //NOT AN EMAIL
  it('should 400 when email is not valid', async () => {
    const response = await request(app.getHttpServer())
      .post(url)
      .send({
        firstname: 'Test',
        lastname: 'User',
        email: 'bla bla bla',
        phonenumber: '+32484750987',
        publicRoles: [PublicRole.CUSTOMER],
        password: '12345678',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.details.body).toHaveProperty('email');
  });

  //NOT A PHONENUMBER
  it('should 400 when phonenumber is not valid', async () => {
    const response = await request(app.getHttpServer())
      .post(url)
      .send({
        firstname: 'Test',
        lastname: 'User',
        email: 'test.user@coop-on.be',
        publicRoles: [PublicRole.CUSTOMER],
        password: '12345678',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.details.body).toHaveProperty('phonenumber');
  });

  describe('GET /api/user/:id', () => {
    it('should 200 and return the requested user', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/5`)
        .set('Authorization', `Bearer ${userAuthToken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toMatchObject({
        id: 5,
        firstname: 'Frank',
        lastname: 'De Wever',
        email: 'frank.dewever@gmail.com',
        phonenumber: '+32484750987',
        publicRoles: [PublicRole.CUSTOMER],
      });
    });

    it('should 200 and return the requested user', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/me`)
        .set('Authorization', `Bearer ${userAuthToken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toMatchObject({
        id: 5,
        firstname: 'Frank',
        lastname: 'De Wever',
        email: 'frank.dewever@gmail.com',
        phonenumber: '+32484750987',
        publicRoles: [PublicRole.CUSTOMER],
      });
    });

    it("should 404 when requesting other user's info", async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/2`)
        .set('Authorization', `Bearer ${userAuthToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No user with this id exists');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should 200 and return the updated user', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/5`)
        .set('Authorization', `Bearer ${userAuthToken}`)
        .send({
          firstname: 'Changed',
          lastname: 'Name',
          email: 'update.user@coop-on.be',
          phonenumber: '+32484750123',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 5,
        firstname: 'Changed',
        lastname: 'Name',
        email: 'update.user@coop-on.be',
        phonenumber: '+32484750123',
        publicRoles: [PublicRole.CUSTOMER],
      });
    });

    it('should 409 for duplicate email', async () => {
      const response = await request(app.getHttpServer())
        .put(`${url}/5`)
        .set('Authorization', `Bearer ${userAuthToken}`)
        .send({
          firstname: 'Changed',
          lastname: 'Name',
          email: 'mario@pizza.be',
        });

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toEqual(
        'There is already a user with this email address',
      );
    });

    it('should 404 with other than signed in user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/3`)
        .set('Authorization', `Bearer ${userAuthToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual('No user with this id exists');
    });

    it('should 404 with not existing user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/123`)
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual('No user with this id exists');
    });

    testAuthHeader(() =>
      request(app.getHttpServer()).put(`${url}/1`).send({
        name: 'Changed name',
        email: 'update.user@hogent.be',
      }),
    );
  });

  describe('DELETE /api/users/:id', () => {
    let deleteAuthToken: string;
    let deleteUserId: number;

    beforeAll(async () => {
      const authService = app.get(AuthService);
      deleteAuthToken = await authService.register({
        firstname: 'Delete',
        lastname: 'User',
        email: 'delete.user@hogent.be',
        password: '12345678',
        phonenumber: '+32484750987',
        publicRoles: [PublicRole.CUSTOMER],
      });

      const deleteUser = await drizzle
        .select()
        .from(users)
        .where(eq(users.email, 'delete.user@hogent.be'));

      deleteUserId = deleteUser[0].id;
    });

    it('should 404 with other than signed in user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/7`)
        .set('Authorization', `Bearer ${userAuthToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual('No user with this id exists');
    });

    it('should 404 with not existing user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/123`)
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No user with this id exists');
    });

    it('should 204 and return nothing', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${url}/${deleteUserId}`)
        .set('Authorization', `Bearer ${deleteAuthToken}`);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    testAuthHeader(() => request(app.getHttpServer()).delete(`${url}/1`));
  });

  describe('GET /api/users/:id/wallets', () => {
    //CUSTOMER
    it('should 200 and return all wallets', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/5/wallets`)
        .set('Authorization', `Bearer ${userAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(2);

      expect(response.body).toEqual(
        expect.arrayContaining([
          {
            active: true,
            createdAt: '2025-08-14T08:00:00.000Z',
            event: { name: 'Rock Werchter' },
            eventId: 2,
            id: 3,
            user: { email: 'update.user@coop-on.be' },
            userId: 5,
            value: 50,
          },
          {
            active: true,
            createdAt: '2025-07-17T08:00:00.000Z',
            event: { name: 'Tomorrow Land' },
            eventId: 3,
            id: 2,
            user: { email: 'update.user@coop-on.be' },
            userId: 5,
            value: 100,
          },
        ]),
      );
    });

    //ADMIN
    it('should 200 and return all wallets', async () => {
      const response = await request(app.getHttpServer())
        .get(`${url}/6/wallets`)
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(1);

      expect(response.body).toEqual(
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
        ]),
      );
    });

    testAuthHeader(() => request(app.getHttpServer()).get(`${url}/1/wallets`));
  });
});
