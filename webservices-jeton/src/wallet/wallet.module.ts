import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { WalletService } from './wallet.service';
import { TransactionService } from '../transaction/transaction.service';
import { EventService } from '../event/event.service';

@Module({
  imports: [DrizzleModule],
  controllers: [WalletController],
  providers: [WalletService, TransactionService, EventService],
  exports: [WalletService, TransactionService, EventService],
})
export class WalletModule {}
