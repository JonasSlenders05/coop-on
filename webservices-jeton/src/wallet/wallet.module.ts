import { forwardRef, Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { WalletService } from './wallet.service';
import { EventModule } from '../event/event.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    DrizzleModule,
    forwardRef(() => EventModule),
    forwardRef(() => TransactionModule),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
