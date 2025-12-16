// test/helpers/login.ts
import { INestApplication } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';

// export const login = async (app: INestApplication): Promise<string> => {
//   const authService = app.get(AuthService); // 👈 1
//   // 👇 2
//   const token = await authService.login({
//     email: 'admin@coop-on.be',
//     password: '12345678',
//   });

//   // 👇 3
//   if (!token) {
//     throw new Error('No token received');
//   }

//   return token; // 👈 4
// };

// 👇 5
export const loginAdmin = async (app: INestApplication): Promise<string> => {
  const authService = app.get(AuthService);
  const token = await authService.login({
    email: 'admin@coop-on.be',
    password: '12345678',
  });

  if (!token) {
    throw new Error('No token received');
  }

  return token;
};

export const loginCustomer = async (app: INestApplication): Promise<string> => {
  const authService = app.get(AuthService);
  const token = await authService.login({
    email: 'frank.dewever@gmail.com',
    password: '12345678',
  });

  if (!token) {
    throw new Error('No token received');
  }

  return token;
};

export const loginOrganiser = async (
  app: INestApplication,
): Promise<string> => {
  const authService = app.get(AuthService);
  const token = await authService.login({
    email: 'dimitri@tommorowland.be',
    password: '12345678',
  });

  if (!token) {
    throw new Error('No token received');
  }

  return token;
};

export const loginVendor = async (app: INestApplication): Promise<string> => {
  const authService = app.get(AuthService);
  const token = await authService.login({
    email: 'mario@pizza.be',
    password: '12345678',
  });

  if (!token) {
    throw new Error('No token received');
  }

  return token;
};
