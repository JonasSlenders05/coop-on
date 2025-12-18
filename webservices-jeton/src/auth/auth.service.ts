import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfig, ServerConfig } from '../config/configuration';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../types/auth';
import { User } from '../types/users';
import { LoginRequestDto } from '../session/session.dto';
import { organisers, users, vendors } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { RegisterUserRequestDto } from '../user/user.dto';
import { PrivateRole, PublicRole } from './roles';

@Injectable()
export class AuthService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider, // 👈 1
    private readonly jwtService: JwtService, // 👈 2
    private readonly configService: ConfigService<ServerConfig>, // 👈 3
  ) {}

  async hashPassword(password: string): Promise<string> {
    const authConfig = this.configService.get<AuthConfig>('auth')!; // 👈 2
    // 👇 3
    return argon2.hash(password, {
      type: argon2.argon2id,
      hashLength: authConfig.hashLength,
      timeCost: authConfig.timeCost,
      memoryCost: authConfig.memoryCost,
    });
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  }

  private signJwt(user: User): string {
    // Parse roles als ze als string uit de DB komen
    const publicRoles =
      typeof user.publicRoles === 'string'
        ? JSON.parse(user.publicRoles)
        : user.publicRoles;

    const privateRoles =
      typeof user.privateRoles === 'string'
        ? JSON.parse(user.privateRoles)
        : user.privateRoles;

    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      privateRoles,
      publicRoles,
    });
  }

  async verifyJwt(token: string): Promise<JwtPayload> {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

    if (!payload) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    return payload;
  }

  async login({ email, password }: LoginRequestDto): Promise<string> {
    const userEmail = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!userEmail) {
      throw new UnauthorizedException(
        'The given email and password do not match',
      );
    }

    const passwordValid = await this.verifyPassword(
      password,
      userEmail.passwordHash,
    );

    if (!passwordValid)
      throw new UnauthorizedException(
        'The given email and password do not match',
      );

    return this.signJwt(userEmail);
  }

  async register({
    firstname,
    lastname,
    email,
    phonenumber,
    password,
    boothName,
    organisation,
    publicRoles,
  }: RegisterUserRequestDto): Promise<string> {
    const passwordHash = await this.hashPassword(password);

    const [newUser] = await this.db
      .insert(users)
      .values({
        firstname,
        lastname,
        email,
        phonenumber,
        passwordHash,
        publicRoles,
        privateRoles: [PrivateRole.USER],
      })
      .$returningId();

    if (publicRoles.includes(PublicRole.VENDOR)) {
      if (!boothName) {
        throw new Error('Boothname is required for vendor registration');
      }

      await this.db.insert(vendors).values({
        userId: newUser.id,
        boothName,
      });
    }

    if (publicRoles.includes(PublicRole.ORGANISER)) {
      if (!organisation) {
        throw new Error('Organisation is required for organiser registration');
      }

      await this.db.insert(organisers).values({
        userId: newUser.id,
        organisation,
      });
    }

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, newUser.id),
    });

    return this.signJwt(user!);
  }
}
