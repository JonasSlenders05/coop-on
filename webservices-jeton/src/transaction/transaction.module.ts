import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { TransactionService } from './transaction.service';
import { WalletService } from '../wallet/wallet.service';
import { EventService } from '../event/event.service';

@Module({
  imports: [DrizzleModule],
  controllers: [TransactionController],
  providers: [TransactionService, WalletService, EventService],
  exports: [TransactionService, WalletService, EventService],
})
export class TransactionModule {}
