import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { TransactionService } from './transaction.service';
import { WalletService } from '../wallet/wallet.service';

@Module({
  imports: [DrizzleModule],
  controllers: [TransactionController],
  providers: [TransactionService, WalletService],
  exports: [TransactionService, WalletService],
})
export class TransactionModule {}
