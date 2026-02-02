import { INestApplication } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { users } from '../../src/drizzle/schema';
import { PublicRole, PrivateRole } from '../../src/auth/roles';

export async function seedUsers(
  app: INestApplication,
  drizzle: DatabaseProvider,
) {
  const authService = app.get(AuthService);
  const passwordHash = await authService.hashPassword('12345678');

  await drizzle.insert(users).values([
    {
      id: 6,
      firstname: 'Dimitri',
      lastname: 'Miami',
      email: 'dimitri@tommorowland.be',
      phonenumber: '+32484750987',
      passwordHash,
      publicRoles: [PublicRole.ORGANISER],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 10,
      firstname: 'Mario',
      lastname: 'Pizza',
      email: 'mario@pizza.be',
      phonenumber: '+32484750987',
      passwordHash,
      publicRoles: [PublicRole.VENDOR],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 5,
      firstname: 'Frank',
      lastname: 'De Wever',
      email: 'frank.dewever@gmail.com',
      phonenumber: '+32484750987',
      passwordHash,
      publicRoles: [PublicRole.CUSTOMER],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 1,
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@coop-on.be',
      phonenumber: '+32484750987',
      passwordHash,
      publicRoles: [
        PublicRole.CUSTOMER,
        PublicRole.ORGANISER,
        PublicRole.VENDOR,
      ],
      privateRoles: [PrivateRole.USER, PrivateRole.ADMIN],
    },
    {
      id: 11,
      firstname: 'Luigi',
      lastname: 'Kebab',
      email: 'Luigi@kebab.be',
      phonenumber: '+32484750987',
      passwordHash,
      publicRoles: [PublicRole.VENDOR],
      privateRoles: [PrivateRole.USER],
    },
  ]);
}

export async function clearUsers(drizzle: DatabaseProvider) {
  await drizzle.delete(users);
}
