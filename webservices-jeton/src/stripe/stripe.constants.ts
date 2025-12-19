// src/stripe/stripe.constants.ts

/**
 * Injection token for Stripe configuration options
 */
export const STRIPE_OPTIONS = 'STRIPE_OPTIONS';

/**
 * Supported payment methods for Stripe integration
 */
export enum StripePaymentMethod {
  CARD = 'card',
  SEPA = 'sepa_debit',
  IDEAL = 'ideal',
  BANCONTACT = 'bancontact',
  GIROPAY = 'giropay',
  EPS = 'eps',
  P24 = 'p24',
  SOFORT = 'sofort',
  ALIPAY = 'alipay',
  WECHAT = 'wechat_pay',
}

/**
 * Supported currencies for Stripe integration
 */
export enum StripeCurrency {
  USD = 'usd',
  EUR = 'eur',
  GBP = 'gbp',
  JPY = 'jpy',
  CAD = 'cad',
  AUD = 'aud',
  CHF = 'chf',
  CNY = 'cny',
  HKD = 'hkd',
  SGD = 'sgd',
}

/**
 * Stripe webhook event types related to wallet functionality
 */
export enum StripeWebhookEvent {
  PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED = 'payment_intent.payment_failed',
  PAYMENT_INTENT_CANCELED = 'payment_intent.canceled',
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
}

/**
 * Common metadata keys used in Stripe objects
 */
export enum StripeMetadataKey {
  USER_ID = 'userId',
  TRANSACTION_TYPE = 'transactionType',
  WALLET_ID = 'walletId',
  PURPOSE = 'purpose',
}
