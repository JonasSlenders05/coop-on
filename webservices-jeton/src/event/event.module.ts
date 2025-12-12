import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { WalletService } from '../wallet/wallet.service';
import { TransactionService } from '../transaction/transaction.service';

@Module({
  imports: [DrizzleModule],
  controllers: [EventController],
  providers: [EventService, WalletService, TransactionService],
  exports: [EventService, WalletService, TransactionService],
})
export class EventModule {}
