import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { WalletService } from './wallet.service';

@Module({
  imports: [DrizzleModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
