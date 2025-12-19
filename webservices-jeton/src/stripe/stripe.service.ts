// src/stripe/stripe.service.ts
import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_OPTIONS } from './stripe.constants';

interface StripeOptions {
  apiKey: string;
  webhookSecret: string;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(@Inject(STRIPE_OPTIONS) private readonly options: StripeOptions) {
    this.stripe = new Stripe(options.apiKey, {
      apiVersion: '2025-12-15.clover', // Use the latest API version
    });
  }

  /**
   * Create a payment intent for wallet topup
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, any> = {},
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
      description: 'Wallet topup',
    });
  }

  /**
   * Get a payment intent by ID
   */
  async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(id);
  }

  /**
   * Create a customer in Stripe
   */
  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, any>,
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  /**
   * Create a charge directly using a payment method
   * Useful for recurring charges from saved payment methods
   */
  async createChargeWithPaymentMethod(
    amount: number,
    currency: string,
    paymentMethodId: string,
    customerId: string,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      description,
      metadata,
    });
  }

  /**
   * Verify and construct a webhook event
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.options.webhookSecret,
    );
  }

  /**
   * Create a Stripe checkout session for wallet topup
   * Alternative to direct Payment Intent creation
   */
  async createCheckoutSession(
    amount: number,
    currency: string = 'usd',
    customerId?: string,
    successUrl?: string,
    cancelUrl?: string,
    metadata?: Record<string, any>,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Wallet Topup',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      customer: customerId,
      success_url:
        successUrl ||
        'https://yourdomain.com/topup/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'https://yourdomain.com/topup/cancel',
      metadata: {
        ...metadata,
        type: 'wallet_topup',
      },
    });
  }

  /**
   * Get a checkout session by ID
   */
  async retrieveCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  /**
   * Get the raw Stripe instance for operations not covered by service methods
   */
  getInstance(): Stripe {
    return this.stripe;
  }
}
