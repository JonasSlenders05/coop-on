import { forwardRef, Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { TransactionService } from './transaction.service';
import { EventModule } from '../event/event.module';
import { VendorModule } from '../vendor/vendor.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    DrizzleModule,
    forwardRef(() => WalletModule),
    forwardRef(() => EventModule),
    VendorModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
