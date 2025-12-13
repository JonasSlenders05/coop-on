import { forwardRef, Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { TransactionModule } from '../transaction/transaction.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    DrizzleModule,
    forwardRef(() => WalletModule),
    forwardRef(() => TransactionModule),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
