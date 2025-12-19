import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  type RawBodyRequest,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { WalletService } from '../wallet/wallet.service';
import Stripe from 'stripe'; // Importeer Stripe voor de types
import { Public } from '../auth/decorators/public.decorator';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly walletService: WalletService,
  ) {}

  @Public()
  @Post()
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!sig) throw new BadRequestException('No signature');
    if (!req.rawBody)
      throw new BadRequestException(
        'No raw body found. Make sure rawBody: true is set in main.ts',
      );

    let event: Stripe.Event;

    try {
      event = this.stripeService.constructWebhookEvent(req.rawBody, sig);
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (!session.metadata) {
        throw new BadRequestException('No metadata found in session');
      }

      const { walletId, tokenCount } = session.metadata;

      if (!walletId || !tokenCount) {
        throw new BadRequestException(
          'Missing walletId or tokenCount in metadata',
        );
      }

      await this.walletService.addTokensToWallet(
        Number(walletId),
        Number(tokenCount),
      );
    }

    return { received: true };
  }
}
