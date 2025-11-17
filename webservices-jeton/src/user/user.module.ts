import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DrizzleModule, AuthModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
