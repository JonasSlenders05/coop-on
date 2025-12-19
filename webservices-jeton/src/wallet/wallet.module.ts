import { forwardRef, Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { WalletService } from './wallet.service';
import { EventModule } from '../event/event.module';
import { TransactionModule } from '../transaction/transaction.module';
import { StripeModule } from '../stripe/stripe.module';
import { StripeWebhookController } from '../stripe/stripe.webhook.controller';
import { PaymentCallbackController } from './payment-callback.controller';

@Module({
  imports: [
    DrizzleModule,
    forwardRef(() => EventModule),
    forwardRef(() => TransactionModule),
    StripeModule,
  ],
  controllers: [
    WalletController,
    StripeWebhookController,
    PaymentCallbackController,
  ],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
