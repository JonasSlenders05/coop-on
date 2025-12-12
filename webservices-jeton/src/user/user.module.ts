import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AuthModule } from '../auth/auth.module';
import { WalletService } from '../wallet/wallet.service';

@Module({
  imports: [DrizzleModule, AuthModule],
  controllers: [UserController],
  providers: [UserService, WalletService],
  exports: [UserService, WalletService],
})
export class UserModule {}
