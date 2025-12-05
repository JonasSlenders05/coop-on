// test/seeds/users.ts
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
      firstname: 'Kees',
      lastname: 'Ketsers',
      email: 'kees@werchter.be',
      phonenumber: '+32484750987',
      passwordHash,
      publicRoles: [PublicRole.ORGANISER],
      privateRoles: [PrivateRole.USER],
    },
    {
      id: 5,
      firstname: 'Frank',
      lastname: 'Vandenbroeke',
      email: 'frank@pukkelpop.be',
      phonenumber: '+32484750987',
      passwordHash,
      publicRoles: [PublicRole.ORGANISER],
      privateRoles: [PrivateRole.USER],
    },
  ]);
}

export async function clearUsers(drizzle: DatabaseProvider) {
  await drizzle.delete(users);
}
